import Anthropic from "@anthropic-ai/sdk";
import { ContentItem } from "./types";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SEARCH_SYSTEM_PROMPT = `You are a helpful content assistant for HUM Premium, a behavioural finance content platform for independent financial advisers.

You will be given a member's search query and a list of content items that may be relevant. Each item includes a title, type, summary, and URL.

Your job: select the most relevant items, group them by content type, and present them clearly.

GROUP results under these headings (only include headings that have results):

## Client Articles
## Adviser Documents
## Infographics
## PDF Guides
## Videos
## Email Sequences

FORMAT EACH RECOMMENDATION LIKE THIS:

### [Title](URL)

One to two sentences explaining why this is relevant to their situation.

---

RULES:
- ONLY recommend items from the list provided. Do not invent, guess, or fabricate any titles, URLs, or content.
- If none of the provided items are a good match, say so honestly and suggest the member try rephrasing their query.
- Use the exact titles and URLs as provided — do not modify them.
- The title MUST be a markdown link: [Title](URL)
- Keep explanations brief — two sentences maximum per item.
- Do not add a preamble or introduction. Start directly with the first group heading.
- Do not add a closing paragraph or summary.
- Only include group headings that contain at least one recommendation.
- Always use UK English spelling (e.g. behaviour, organise, colour, favour, practise, capitalise).
- Always use "adviser" — never "advisor".`;

export async function getRecommendations(
  query: string,
  items: Omit<ContentItem, "embedding">[]
): Promise<string> {
  const contentList = items
    .map(
      (item, i) =>
        `${i + 1}. Title: ${item.title}\n   Type: ${item.type}\n   URL: ${item.url}\n   Summary: ${item.summary}`
    )
    .join("\n\n");

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
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
