import Anthropic from "@anthropic-ai/sdk";
import { ContentType } from "./types";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `You are a content indexer for HUM Premium, a behavioural finance content platform for independent financial advisers.

HUM Premium helps advisers communicate better with clients, reinforce long-term decision-making, and build deeper relationships. Members use this content in client newsletters, meetings, on their websites, and in follow-up communications.

The platform believes that good financial advice is primarily about behaviour, not products, and that consistency of communication matters more than intensity.

When summarising content, focus on:
- What client scenarios or situations this content is useful for
- What emotional or behavioural challenge it addresses
- When an adviser would reach for this (e.g. after a panic call, before a first meeting, during a market correction, when onboarding a new client)
- Key concepts or frameworks mentioned in the content itself
- What type of client this works best for (e.g. pre-retirees, nervous investors, couples, high-net-worth)

Do NOT describe the content academically. Describe it as a practical tool an adviser would use. Do NOT reference frameworks or concepts that are not explicitly in the content. Write in plain English, approximately 150 words.

LANGUAGE RULES:
- Always use UK English spelling (e.g. behaviour, organise, colour, favour, practise, capitalise)
- Always use "adviser" — never "advisor"`;

export async function generateSummary(
  content: string,
  contentType: ContentType,
  title: string,
  mediaType?: string
): Promise<string> {
  const isInfographic = contentType === "infographic";
  const isPdf = contentType === "pdf-guide";
  const typeLabel = contentType.replace("-", " ");

  const userMessage = isInfographic
    ? `This is an infographic titled "${title}". Please analyse the image and create a search-optimised summary describing when and how a financial adviser would use this with clients.`
    : isPdf
      ? `This is a PDF guide titled "${title}". Please read the document and create a search-optimised summary describing when and how a financial adviser would use this with clients.`
      : `This is a ${typeLabel} titled "${title}". Please create a search-optimised summary:\n\n${content}`;

  let messageContent: Anthropic.MessageCreateParams["messages"][0]["content"];

  if (isInfographic) {
    const imageMediaType = (mediaType || "image/png") as "image/png" | "image/jpeg" | "image/gif" | "image/webp";
    messageContent = [
      { type: "image", source: { type: "base64", media_type: imageMediaType, data: content } },
      { type: "text", text: userMessage },
    ];
  } else if (isPdf) {
    messageContent = [
      { type: "document", source: { type: "url", url: content } },
      { type: "text", text: userMessage },
    ];
  } else {
    messageContent = userMessage;
  }

  const response = await getAnthropic().messages.create({
    model: isInfographic ? "claude-opus-4-20250514" : "claude-sonnet-4-20250514",
    max_tokens: 500,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: messageContent,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}
