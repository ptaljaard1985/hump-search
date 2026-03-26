/**
 * Quick test: connect to Supabase, insert a test row, read it back, delete it.
 *
 * Usage: npx tsx scripts/test-supabase.ts
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function test() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const testId = "00000000-0000-0000-0000-000000000099";

  // 1. Insert a test row
  console.log("1. Inserting test row...");
  const fakeEmbedding = new Array(1536).fill(0.01);
  const { error: insertErr } = await supabase.from("content_items").insert({
    id: testId,
    title: "Test Item",
    url: "https://example.com/test",
    type: "article",
    summary: "This is a test summary.",
    embedding: JSON.stringify(fakeEmbedding),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (insertErr) {
    console.error("   INSERT failed:", insertErr.message);
    process.exit(1);
  }
  console.log("   OK");

  // 2. Read it back
  console.log("2. Reading test row...");
  const { data, error: readErr } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", testId)
    .single();

  if (readErr) {
    console.error("   SELECT failed:", readErr.message);
    process.exit(1);
  }
  console.log(`   OK — title: "${data.title}", embedding length: ${
    typeof data.embedding === "string"
      ? JSON.parse(data.embedding).length
      : data.embedding.length
  }`);

  // 3. Delete it
  console.log("3. Deleting test row...");
  const { error: delErr } = await supabase
    .from("content_items")
    .delete()
    .eq("id", testId);

  if (delErr) {
    console.error("   DELETE failed:", delErr.message);
    process.exit(1);
  }
  console.log("   OK");

  // 4. Confirm it's gone
  console.log("4. Confirming deletion...");
  const { data: check } = await supabase
    .from("content_items")
    .select("id")
    .eq("id", testId);

  if (check && check.length === 0) {
    console.log("   OK — row deleted");
  } else {
    console.error("   Row still exists!");
    process.exit(1);
  }

  console.log("\nAll tests passed.");
}

test();
