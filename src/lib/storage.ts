import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ContentIndex, ContentItem } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: SupabaseClient<any, "public", any> | null = null;

function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
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
  const items: ContentItem[] = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    url: row.url as string,
    type: row.type as ContentItem["type"],
    summary: row.summary as string,
    embedding:
      typeof row.embedding === "string"
        ? JSON.parse(row.embedding)
        : row.embedding as number[],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
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

  // Use two separate queries to avoid filter injection from special characters
  const [titleResult, urlResult] = await Promise.all([
    supabase.from("content_items").select("id, title, url, type").ilike("title", normTitle),
    supabase.from("content_items").select("id, title, url, type").ilike("url", normUrl),
  ]);

  if (titleResult.error) {
    throw new Error(`Failed to check duplicates: ${titleResult.error.message}`);
  }
  if (urlResult.error) {
    throw new Error(`Failed to check duplicates: ${urlResult.error.message}`);
  }

  const allRows = [...(titleResult.data || []), ...(urlResult.data || [])];
  if (allRows.length === 0) return null;

  const rows = allRows as { id: string; title: string; url: string; type: string }[];
  const titleMatch = rows.find((d) => d.title.trim().toLowerCase() === normTitle);
  const urlMatch = rows.find(
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

  const { data, error } = await supabase
    .from("content_items")
    .update(row)
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`Failed to update content item: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("Content item not found");
  }
}

export async function deleteContentItem(id: string): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("content_items")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`Failed to delete content item: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("Content item not found");
  }
}
