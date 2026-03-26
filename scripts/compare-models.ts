/**
 * Compare search results between Claude Sonnet and Haiku.
 *
 * Usage: npx tsx scripts/compare-models.ts
 *
 * Runs the same queries through both models and writes results to
 * scripts/comparison-results.md for side-by-side review.
 */
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";

// Load .env.local
for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TEST_QUERIES = [
  "client panicking about market drop",
  "something to send in a newsletter about staying invested long term",
  "infographic about risk",
  "onboarding pack for new clients",
  "how to talk to couples who disagree about money",
];

const SYSTEM_PROMPT = `You are a helpful content assistant for HUM Premium, a behavioural finance content platform for independent financial advisers.

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
- Do not add a closing paragraph or summary.
- Always use UK English spelling (e.g. behaviour, organise, colour, favour, practise, capitalise).
- Always use "adviser" — never "advisor".`;

const MODELS = [
  { id: "claude-sonnet-4-20250514", label: "Sonnet 4" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5" },
] as const;

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY || !process.env.ANTHROPIC_API_KEY) {
    console.error("Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ANTHROPIC_API_KEY env vars");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Fetch all items (no embeddings needed)
  const { data: items, error } = await supabase
    .from("content_items")
    .select("id, title, url, type, summary");

  if (error) {
    console.error("Failed to fetch items:", error.message);
    process.exit(1);
  }

  console.log(`Loaded ${items.length} content items\n`);

  const contentList = items
    .map(
      (item: { title: string; type: string; url: string; summary: string }, i: number) =>
        `${i + 1}. Title: ${item.title}\n   Type: ${item.type}\n   URL: ${item.url}\n   Summary: ${item.summary}`
    )
    .join("\n\n");

  let output = `# Model Comparison: Sonnet 4 vs Haiku 4.5\n\nGenerated: ${new Date().toISOString()}\nItems in index: ${items.length}\n\n`;

  for (const query of TEST_QUERIES) {
    console.log(`Query: "${query}"`);
    output += `---\n\n## Query: "${query}"\n\n`;

    for (const model of MODELS) {
      console.log(`  Running ${model.label}...`);
      const start = Date.now();

      const response = await anthropic.messages.create({
        model: model.id,
        max_tokens: 800,
        temperature: 0,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Member's search query: "${query}"\n\nAvailable content:\n\n${contentList}`,
          },
        ],
      });

      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const textBlock = response.content.find((block) => block.type === "text");
      const result = textBlock ? textBlock.text : "(no response)";
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;

      console.log(`  ${model.label}: ${elapsed}s, ${inputTokens} in / ${outputTokens} out`);

      output += `### ${model.label} (${elapsed}s — ${inputTokens} in / ${outputTokens} out)\n\n${result}\n\n`;
    }
  }

  const outPath = "scripts/comparison-results.md";
  writeFileSync(outPath, output);
  console.log(`\nResults written to ${outPath}`);
}

main();
