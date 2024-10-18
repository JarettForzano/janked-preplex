import axios from "axios";
import OpenAI from "openai";

const SERP_API_KEY = process.env.SERP_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const model = "gpt-4o-mini";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

let allowedUrls = [];

async function scrapeWebsite(url) {
    console.log(`Scraping URL: ${url}`);
    const params = { urls: [url] };

    try {
        const response = await axios.post(`http://localhost:8000/api/scrape`, params, {
            headers: { 'Content-Type': 'application/json' }
        });

        const results = response.data.results.map(result => ({
            url: result.url,
            content: result.content
        }));

        return results[0]; // Return the first result for simplicity
    } catch (error) {
        console.error(`Error scraping links: ${error}`);
        return { url, content: '' };
    }
}

async function serpSearch(query) {
    console.log(`Performing SERP search for query: ${query}`);
    const data = JSON.stringify({ "q": query });

    try {
        const response = await axios.post('https://google.serper.dev/search', data, {
            headers: {
                'X-API-KEY': SERP_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        // Extract URLs and snippets from the response and update allowedUrls
        allowedUrls = response.data.organic.map(result => result.link);
        if (response.data.answerBox && response.data.answerBox.sourceLink) {
            allowedUrls.push(response.data.answerBox.sourceLink);
        }

        // Format the results for the agent
        const formattedResults = response.data.organic.map((result, index) => ({
            index: index + 1,
            title: result.title,
            snippet: result.snippet,
            link: result.link
        }));

        // Include the answerBox if present
        if (response.data.answerBox) {
            formattedResults.unshift({
                index: 0,
                title: response.data.answerBox.title || '',
                snippet: response.data.answerBox.answer || response.data.answerBox.snippet || '',
                link: response.data.answerBox.link || response.data.answerBox.source || ''
            });
        }

        return {
            query: query,
            results: formattedResults
        };
    } catch (error) {
        console.error(`Error searching the web: ${error.message}`);
        return { query, results: [] };
    }
}

// Define system messages and tools
const systemPrompt = `
You are a world-class research assistant with access to the following tools:

1. **serpSearch(query)**: Searches the web and returns a list of results with titles, snippets, and links.
2. **scrapeWebsite(url)**: Scrapes detailed content from a specific URL.

**Instructions:**

- Begin by analyzing the user's question to determine what information is needed.
- Use **serpSearch** to get initial information.
- Carefully read through the provided results and snippets to see if any contain the answer.
- If the answer is found in a snippet, you can provide the answer and cite the source.
- If not, consider using **scrapeWebsite** on the most promising URLs for more details.
- Use chain-of-thought reasoning internally to decide which tool to use next.
- **When sharing your thoughts with the user, keep them concise (maximum 2 sentences) and do not include the 'Thought:' prefix.**
- **Do not include any function names, function calls, or implementation details in your messages to the user.**
- **When you need to use a tool, make a function call, but do not mention it to the user.**
- **When you have the final answer, present it clearly and include a "Sources" section with the URLs.**

**Example Interaction:**

User: "How many employees does Apple have?"

Assistant:
- "I need to find the most recent number of Apple's employees."
- "Apple has approximately 147,000 full-time employees as of 2023.

Sources:
- [Apple Investor Relations](https://investor.apple.com/)
"
`;

export default async function runResearchAssistant(query, ws) {
    const messages = [
        {
            "role": "system",
            "content": systemPrompt
        },
        {
            "role": "user",
            "content": query
        }
    ];

    try {
        while (true) {
            const response = await openai.chat.completions.create({
                model: model,
                messages: messages,
                functions: [
                    {
                        name: "serpSearch",
                        description: "Search the web for information",
                        parameters: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "The search query"
                                }
                            },
                            required: ["query"]
                        }
                    },
                    {
                        name: "scrapeWebsite",
                        description: "Scrape content from a website",
                        parameters: {
                            type: "object",
                            properties: {
                                url: {
                                    type: "string",
                                    description: "The URL to scrape"
                                }
                            },
                            required: ["url"]
                        }
                    }
                ],
                function_call: "auto",
                temperature: 0.7, // Adjust as needed
                max_tokens: 500    // Adjust as needed
            });

            const responseMessage = response.choices[0].message;
            let content = responseMessage.content || "";
            const functionCall = responseMessage.function_call;

            // Remove 'Thought:' prefix if present
            content = content.replace(/^Thought:\s*/i, '').trim();

            // Truncate content to first 2 sentences
            content = content.split('. ').slice(0, 2).join('. ').trim();

            // Remove any function call details from content
            content = content.replace(/functions?\.\w+\(.*\)/g, '').trim();

            if (functionCall) {
                const functionName = functionCall.name;
                const functionArgs = JSON.parse(functionCall.arguments);

                let toolResponse;
                if (functionName === "serpSearch") {
                    toolResponse = await serpSearch(functionArgs.query);
                } else if (functionName === "scrapeWebsite") {
                    if (allowedUrls.includes(functionArgs.url)) {
                        toolResponse = await scrapeWebsite(functionArgs.url);
                    } else {
                        toolResponse = { content: '', error: `Access denied to URL: ${functionArgs.url}` };
                    }
                } else {
                    toolResponse = { error: `Unknown tool: ${functionName}` };
                }

                // Format the tool response
                let toolResponseContent = '';
                if (functionName === "serpSearch") {
                    toolResponseContent = toolResponse.results.map(result => {
                        return `Result ${result.index}:
Title: ${result.title}
Snippet: ${result.snippet}
Link: ${result.link}`;
                    }).join('\n\n');
                } else if (functionName === "scrapeWebsite") {
                    if (toolResponse.content) {
                        toolResponseContent = `Content from ${functionArgs.url}:\n${toolResponse.content}`;
                    } else {
                        toolResponseContent = `Failed to scrape ${functionArgs.url}`;
                    }
                }

                // Send the assistant's thought process to the frontend if it's not empty
                if (content !== '') {
                    ws.send(JSON.stringify({ type: 'assistant', content }));
                }

                // Add the assistant's response and tool's observation to messages
                messages.push({
                    "role": "assistant",
                    "content": content,
                    "function_call": functionCall
                });

                messages.push({
                    "role": "function",
                    "name": functionName,
                    "content": toolResponseContent
                });

            } else {
                // Send the final answer to the frontend
                ws.send(JSON.stringify({ type: 'answer', content: content.trim() }));
                ws.send(JSON.stringify({ type: 'end' }));
                ws.close();
                break;
            }
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
        ws.send(JSON.stringify({ type: 'error', content: error.message }));
        ws.close();
    }
}
