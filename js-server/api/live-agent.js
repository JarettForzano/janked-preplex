import axios from 'axios';
import OpenAI from 'openai';

const SERP_API_KEY = process.env.SERP_API_KEY; // Ensure this is set in your environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your environment variables
const model = 'gpt-4'; // Use 'gpt-4' or your preferred model

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

let allowedUrls = [];

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

    return results[0]; // Return the first result for simplicity
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

    // Extract URLs and snippets from the response and update allowedUrls
    allowedUrls = response.data.organic.map((result) => result.link);
    if (response.data.answerBox && response.data.answerBox.sourceLink) {
      allowedUrls.push(response.data.answerBox.sourceLink);
    }

    // Format the results for the agent
    const formattedResults = response.data.organic.map((result, index) => ({
      index: index + 1,
      title: result.title,
      snippet: result.snippet,
      link: result.link,
    }));

    // Include the answerBox if present
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

// Define the system prompt with Markdown formatting instructions
const systemPrompt = `
You are a world-class research assistant with access to the following tools:

1. **serpSearch(query)**: Searches the web and returns a list of results with titles, snippets, and links.
2. **scrapeWebsite(url)**: Scrapes detailed content from a specific URL.

**Instructions:**

- Begin by analyzing the user's question to determine what information is needed.
- **First, plan the steps you will take to answer the question and share this plan with the user, formatted in Markdown. Use bullet points or numbered lists for clarity. Do not include any function call details or implementation details in the plan.**
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

[Assistant then executes the steps internally.]

Assistant:

\`\`\`markdown
Apple has approximately **147,000** full-time employees as of 2023.

**Sources:**

- [Apple Investor Relations](https://investor.apple.com/)
- [Wikipedia - Apple Inc.](https://en.wikipedia.org/wiki/Apple_Inc/)
\`\`\`
`;

export default async function runResearchAssistant(query, ws) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query },
  ];

  try {
    // Stream the assistant's plan
    const planningResponse = await openai.chat.completions.create(
      {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      },
      { responseType: 'stream' }
    );

    let planContent = '';

    for await (const part of planningResponse) {
      const { choices } = part;
      if (choices && choices.length > 0) {
        const delta = choices[0].delta;
        if (delta && delta.content) {
          planContent += delta.content;
          for (const char of delta.content) {
            ws.send(JSON.stringify({ type: 'plan_part', content: char }));
          }
        }
      }
    }

    // Add the assistant's plan to the messages
    messages.push({ role: 'assistant', content: planContent });

    // Proceed to execute the steps internally
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
      });

      const responseMessage = response.choices[0].message;
      const functionCall = responseMessage.function_call;

      if (functionCall) {
        const functionName = functionCall.name;
        const functionArgs = JSON.parse(functionCall.arguments);

        let toolResponse;
        if (functionName === 'serpSearch') {
          toolResponse = await serpSearch(functionArgs.query);
        } else if (functionName === 'scrapeWebsite') {
          if (allowedUrls.includes(functionArgs.url)) {
            toolResponse = await scrapeWebsite(functionArgs.url);
          } else {
            toolResponse = { content: '', error: `Access denied to URL: ${functionArgs.url}` };
          }
        }

        // Prepare the observation
        let observation = '';
        if (functionName === 'serpSearch') {
          observation = toolResponse.results.map((result) => {
            return `Result ${result.index}:
Title: ${result.title}
Snippet: ${result.snippet}
Link: ${result.link}`;
          }).join('\n\n');
        } else if (functionName === 'scrapeWebsite') {
          observation = toolResponse.content || `Failed to scrape ${functionArgs.url}`;
        }

        // Add the assistant's message and function call to the messages
        messages.push({
          role: 'assistant',
          content: responseMessage.content || '',
          function_call: functionCall,
        });

        // Add the observation to the messages
        messages.push({
          role: 'function',
          name: functionName,
          content: observation,
        });
      } else {
        // Assistant provides the final answer
        messages.push({ role: 'assistant', content: responseMessage.content || '' });

        // Stream the final answer
        const finalAnswerResponse = await openai.chat.completions.create(
          {
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 500,
            stream: true,
          },
          { responseType: 'stream' }
        );

        for await (const part of finalAnswerResponse) {
          const { choices } = part;
          if (choices && choices.length > 0) {
            const delta = choices[0].delta;
            if (delta && delta.content) {
              for (const char of delta.content) {
                ws.send(JSON.stringify({ type: 'answer_part', content: char }));
              }
            }
          }
        }

        ws.send(JSON.stringify({ type: 'end' }));
        ws.close();

        assistantHasFinished = true;
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
    ws.send(JSON.stringify({ type: 'error', content: error.message }));
    ws.close();
  }
}
