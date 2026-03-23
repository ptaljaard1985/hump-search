import Anthropic from "@anthropic-ai/sdk";
import { SearchResult } from "./types";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SEARCH_SYSTEM_PROMPT = `You are a helpful content assistant for HUM Premium, a behavioural finance content platform for independent financial advisers.

You will be given a member's search query and a list of content items that may be relevant. Each item includes a title, type, summary, and URL.

Your job:
1. Select the 3–5 most relevant items for the member's query
2. For each, explain briefly why it's relevant to their specific situation
3. Include the exact title and URL for each recommendation

CRITICAL RULES:
- ONLY recommend items from the list provided. Do not invent, guess, or fabricate any titles, URLs, or content.
- If none of the provided items are a good match, say so honestly and suggest the member try rephrasing their query or browsing the content library directly.
- Use the exact titles and URLs as provided — do not modify them.

Respond in a warm, helpful tone. Keep it concise. Format recommendations as a numbered list.`;

export async function getRecommendations(
  query: string,
  candidates: SearchResult[]
): Promise<string> {
  const contentList = candidates
    .map(
      (c, i) =>
        `${i + 1}. Title: ${c.item.title}\n   Type: ${c.item.type}\n   URL: ${c.item.url}\n   Summary: ${c.item.summary}`
    )
    .join("\n\n");

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    temperature: 0,
    system: SEARCH_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Member's search query: "${query}"\n\nAvailable content:\n\n${contentList}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "Sorry, I wasn't able to generate recommendations.";
}
