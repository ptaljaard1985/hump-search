import { createClient } from "@supabase/supabase-js";
import { ContentIndex, ContentItem } from "./types";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

export async function getContentIndex(): Promise<ContentIndex> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("content_items")
    .select("*");

  if (error) {
    throw new Error(`Failed to fetch content index: ${error.message}`);
  }

  // Convert pgvector string format "[0.1,0.2,...]" to number[] if needed
  const items: ContentItem[] = (data || []).map((row) => ({
    ...row,
    embedding:
      typeof row.embedding === "string"
        ? JSON.parse(row.embedding)
        : row.embedding,
  }));

  return { items };
}

export async function getContentItems(): Promise<Omit<ContentItem, "embedding">[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("content_items")
    .select("id, title, url, type, summary, created_at, updated_at");

  if (error) {
    throw new Error(`Failed to fetch content items: ${error.message}`);
  }

  return data || [];
}

export async function checkDuplicate(
  title: string,
  url: string
): Promise<{ matchType: string; item: { id: string; title: string; url: string; type: string } } | null> {
  const supabase = getSupabase();
  const normTitle = title.trim().toLowerCase();
  const normUrl = url.trim().toLowerCase().replace(/\/+$/, "");

  const { data, error } = await supabase
    .from("content_items")
    .select("id, title, url, type")
    .or(`title.ilike.${normTitle},url.ilike.${normUrl}`);

  if (error) {
    throw new Error(`Failed to check duplicates: ${error.message}`);
  }

  if (!data || data.length === 0) return null;

  // Check which field matched
  const titleMatch = data.find((d) => d.title.trim().toLowerCase() === normTitle);
  const urlMatch = data.find(
    (d) => d.url.trim().toLowerCase().replace(/\/+$/, "") === normUrl
  );

  if (!titleMatch && !urlMatch) return null;

  const match = titleMatch || urlMatch;
  const matchType = titleMatch && urlMatch ? "title and URL" : titleMatch ? "title" : "URL";

  return { matchType, item: match! };
}

export async function addContentItem(item: ContentItem): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("content_items").insert({
    id: item.id,
    title: item.title,
    url: item.url,
    type: item.type,
    summary: item.summary,
    embedding: JSON.stringify(item.embedding),
    created_at: item.created_at,
    updated_at: item.updated_at,
  });

  if (error) {
    throw new Error(`Failed to add content item: ${error.message}`);
  }
}

export async function replaceContentItem(oldId: string, item: ContentItem): Promise<void> {
  const supabase = getSupabase();

  const { error: deleteError } = await supabase
    .from("content_items")
    .delete()
    .eq("id", oldId);

  if (deleteError) {
    throw new Error(`Failed to delete old item: ${deleteError.message}`);
  }

  await addContentItem(item);
}

export async function updateContentItem(
  id: string,
  updates: Partial<Pick<ContentItem, "title" | "url" | "summary" | "embedding">>
): Promise<void> {
  const supabase = getSupabase();

  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.url !== undefined) row.url = updates.url;
  if (updates.summary !== undefined) row.summary = updates.summary;
  if (updates.embedding !== undefined) row.embedding = JSON.stringify(updates.embedding);

  const { error, count } = await supabase
    .from("content_items")
    .update(row)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update content item: ${error.message}`);
  }
  if (count === 0) {
    throw new Error("Content item not found");
  }
}

export async function deleteContentItem(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error, count } = await supabase
    .from("content_items")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete content item: ${error.message}`);
  }
  if (count === 0) {
    throw new Error("Content item not found");
  }
}
