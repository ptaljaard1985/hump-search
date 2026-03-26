/**
 * One-time migration: load content-index backup JSON and insert into Supabase.
 *
 * Usage: npx tsx scripts/migrate-to-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load .env.local
for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BACKUP_FILE = process.argv[2] || "content-index-backup-2026-03-25.json";

async function migrate() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const raw = readFileSync(BACKUP_FILE, "utf-8");
  const { items } = JSON.parse(raw);

  console.log(`Loaded ${items.length} items from ${BACKUP_FILE}`);

  // Insert in batches of 20 to avoid request size limits
  const BATCH = 20;
  let inserted = 0;

  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH).map((item: Record<string, unknown>) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      type: item.type,
      summary: item.summary,
      embedding: JSON.stringify(item.embedding),
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    const { error } = await supabase.from("content_items").insert(batch);
    if (error) {
      console.error(`Batch ${i / BATCH + 1} failed:`, error.message);
      // Try inserting one by one to identify the problem row
      for (const row of batch) {
        const { error: rowError } = await supabase.from("content_items").insert(row);
        if (rowError) {
          console.error(`  Failed: ${row.title} — ${rowError.message}`);
        } else {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
      console.log(`  Inserted batch ${Math.floor(i / BATCH) + 1} (${inserted} total)`);
    }
  }

  console.log(`\nDone: ${inserted}/${items.length} items migrated`);
}

migrate();
