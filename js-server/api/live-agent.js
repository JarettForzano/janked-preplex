import axios from 'axios';
import OpenAI from 'openai';

const SERP_API_KEY = process.env.SERP_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const model = 'gpt-4';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function scrapeWebsite(url) {
  console.log(`Scraping URL: ${url}`);
  const params = { urls: [url] };

  try {
    const response = await axios.post(`http://localhost:8000/api/scrape`, params, {
      headers: { 'Content-Type': 'application/json' },
    });

    const results = response.data.results.map((result) => ({
      url: result.url,
      content: result.content,
    }));

    return results[0];
  } catch (error) {
    console.error(`Error scraping links: ${error}`);
    return { url, content: '' };
  }
}

async function serpSearch(query) {
  console.log(`Performing SERP search for query: ${query}`);
  const data = JSON.stringify({ q: query });

  try {
    const response = await axios.post('https://google.serper.dev/search', data, {
      headers: {
        'X-API-KEY': SERP_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const formattedResults = response.data.organic.map((result, index) => ({
      index: index + 1,
      title: result.title,
      snippet: result.snippet,
      link: result.link,
    }));

    if (response.data.answerBox) {
      formattedResults.unshift({
        index: 0,
        title: response.data.answerBox.title || '',
        snippet:
          response.data.answerBox.answer || response.data.answerBox.snippet || '',
        link: response.data.answerBox.link || response.data.answerBox.source || '',
      });
    }

    return {
      query: query,
      results: formattedResults,
    };
  } catch (error) {
    console.error(`Error searching the web: ${error.message}`);
    return { query, results: [] };
  }
}

const systemPrompt = `
You are a world-class research assistant with access to the following tools:

1. **serpSearch(query)**: Searches the web and returns a list of results with titles, snippets, and links.
2. **scrapeWebsite(url)**: Scrapes detailed content from a specific URL.

**Instructions:**

- Begin by analyzing the user's question to determine what information is needed.
- **First, plan the steps you will take to answer the question and share this plan with the user, formatted in Markdown. Use bullet points or numbered lists for clarity. Do not include any function call details or implementation details in the plan.**
- **Before executing each step, update the user with a brief summary of what you are about to do and why. Provide these updates in natural language to keep the user informed of your progress.**
- **After executing each step, provide a brief summary of what you learned or achieved in that step, along with any next steps.**
- If you encounter roadblocks or need to change your strategy, explain why and outline your new plan.
- **Do not proceed to execute the steps until you have shared your plan.**
- **Since you cannot receive user confirmation, proceed to execute the steps after sharing your plan.**
- Use **serpSearch** to get initial information.
- Carefully read through the provided results and snippets to see if any contain the answer.
- If the answer is found in a snippet, you can provide the answer and cite the source.
- If not, consider using **scrapeWebsite** on the most promising URLs for more details.
- **When providing the final answer, format it in Markdown. Include the sources as a list of clickable links.**
- **Do not include any function names, function calls, or implementation details in your messages to the user.**

**Example Interaction:**

User: "How many employees does Apple have?"

Assistant:

\`\`\`markdown
To answer your question, I will:

1. Perform a web search to find the most recent number of Apple's employees.
2. Verify the information from reliable and official sources.

Let me proceed to find the answer for you.
\`\`\`

[Assistant proceeds with the first step]

Assistant:

\`\`\`markdown
I’m now searching for recent statistics on the number of employees at Apple.
\`\`\`

[After search execution]

Assistant:

\`\`\`markdown
I found several results. Most point to Apple having approximately **147,000** full-time employees as of 2023. Now, I will verify this from reliable sources.
\`\`\`

[Assistant executes verification]

Assistant:

\`\`\`markdown
Apple has approximately **147,000** full-time employees as of 2023.

**Sources:**

- [Apple Investor Relations](https://investor.apple.com/)
- [Wikipedia - Apple Inc.](https://en.wikipedia.org/wiki/Apple_Inc/)
\`\`\`
`;

export default async function runResearchAssistant(query, ws) {
  const messages = [{ role: 'system', content: systemPrompt }];
  messages.push({ role: 'user', content: query });

  try {
    let assistantHasFinished = false;
   
    while (!assistantHasFinished) {
      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
        functions: [
          {
            name: 'serpSearch',
            description: 'Search the web for information',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'scrapeWebsite',
            description: 'Scrape content from a website',
            parameters: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The URL to scrape',
                },
              },
              required: ['url'],
            },
          },
        ],
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
      });

      const message = response.choices[0].message;
      messages.push(message);

      if (message.content) {
        // Send the assistant's message to the user
        ws.send(JSON.stringify({ type: 'assistant', content: message.content }));
      }

      if (message.function_call) {
        const functionName = message.function_call.name;
        const functionArgs = JSON.parse(message.function_call.arguments);

        let functionResponse;

        if (functionName === 'serpSearch') {
          functionResponse = await serpSearch(functionArgs.query);
        } else if (functionName === 'scrapeWebsite') {
          functionResponse = await scrapeWebsite(functionArgs.url);
        } else {
          functionResponse = { error: 'Unknown function' };
        }

        // Append the function response to the messages
        messages.push({
          role: 'function',
          name: functionName,
          content: JSON.stringify(functionResponse),
        });
      } else {
        assistantHasFinished = true;
      }
    }

    ws.send(JSON.stringify({ type: 'end' }));
    ws.close();
  } catch (error) {
    console.error('An error occurred:', error);
    ws.send(JSON.stringify({ type: 'error', content: error.message }));
    ws.close();
  }
}
