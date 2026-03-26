/**
 * Re-generate embeddings for all content items using title + type + summary.
 *
 * Usage: npx tsx scripts/reembed-all.ts
 *
 * This is needed after changing what text gets embedded (e.g. adding title/type
 * to the embedding input). Safe to run multiple times — it overwrites embeddings
 * in place without touching other fields.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import OpenAI from "openai";

// Load .env.local
for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

function buildEmbeddingText(title: string, type: string, summary: string): string {
  const typeLabel = type.replace("-", " ");
  return `${title}\n${typeLabel}\n\n${summary}`;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
    console.error("Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY env vars");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const { data: items, error } = await supabase
    .from("content_items")
    .select("id, title, type, summary");

  if (error) {
    console.error("Failed to fetch items:", error.message);
    process.exit(1);
  }

  console.log(`Found ${items.length} items to re-embed\n`);

  for (const item of items) {
    const text = buildEmbeddingText(item.title, item.type, item.summary);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    const embedding = response.data[0].embedding;

    const { error: updateError } = await supabase
      .from("content_items")
      .update({ embedding: JSON.stringify(embedding), updated_at: new Date().toISOString() })
      .eq("id", item.id);

    if (updateError) {
      console.error(`  FAILED: ${item.title} — ${updateError.message}`);
    } else {
      console.log(`  ✓ ${item.title}`);
    }
  }

  console.log("\nDone!");
}

main();
