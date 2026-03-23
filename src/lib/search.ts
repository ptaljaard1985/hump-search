import Anthropic from "@anthropic-ai/sdk";
import { SearchResult } from "./types";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SEARCH_SYSTEM_PROMPT = `You are a helpful content assistant for HUM Premium, a behavioural finance content platform for independent financial advisers.

You will be given a member's search query and a list of content items that may be relevant. Each item includes a title, type, summary, and URL.

Your job: select the most relevant items and present them clearly.

FORMAT EACH RECOMMENDATION EXACTLY LIKE THIS:

### [Title](URL)
*Type*

One to two sentences explaining why this is relevant to their situation.

---

RULES:
- ONLY recommend items from the list provided. Do not invent, guess, or fabricate any titles, URLs, or content.
- If none of the provided items are a good match, say so honestly and suggest the member try rephrasing their query.
- Use the exact titles and URLs as provided — do not modify them.
- The title MUST be a markdown link: [Title](URL)
- Keep explanations brief — two sentences maximum per item.
- Do not add a preamble or introduction. Start directly with the first recommendation.
- Do not add a closing paragraph or summary.`;

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
