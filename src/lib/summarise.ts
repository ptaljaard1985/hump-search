import Anthropic from "@anthropic-ai/sdk";
import { ContentType } from "./types";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `You are a content indexer for HUM Premium, a behavioural finance content platform for independent financial advisers.

HUM Premium helps advisers communicate better with clients, reinforce long-term decision-making, and build deeper relationships. Members use this content in client newsletters, meetings, on their websites, and in follow-up communications.

When summarising content, focus on:
- What client scenarios or situations this content is useful for
- What emotional or behavioural challenge it addresses
- When an adviser would reach for this (e.g. after a panic call, before a first meeting, during a market correction, when onboarding a new client)
- Key concepts or frameworks mentioned
- What type of client this works best for (e.g. pre-retirees, nervous investors, couples, high-net-worth)

Do NOT describe the content academically. Describe it as a practical tool an adviser would use. Write in plain English, approximately 150 words.`;

export async function generateSummary(
  content: string,
  contentType: ContentType,
  title: string
): Promise<string> {
  const isInfographic = contentType === "infographic";

  const userMessage = isInfographic
    ? `This is an infographic titled "${title}". Please analyse the image and create a search-optimised summary describing when and how a financial adviser would use this with clients.`
    : `This is a ${contentType.replace("-", " ")} titled "${title}". Please create a search-optimised summary:\n\n${content}`;

  const response = await getAnthropic().messages.create({
    model: isInfographic ? "claude-opus-4-20250514" : "claude-sonnet-4-20250514",
    max_tokens: 300,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: isInfographic
          ? [
              { type: "image", source: { type: "base64", media_type: "image/png", data: content } },
              { type: "text", text: userMessage },
            ]
          : userMessage,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}
