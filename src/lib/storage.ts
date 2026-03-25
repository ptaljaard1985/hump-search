import { put, list, del } from "@vercel/blob";
import { ContentIndex, ContentItem } from "./types";

const BLOB_FILENAME = "content-index.json";

export async function getContentIndex(): Promise<ContentIndex> {
  const { blobs } = await list({ prefix: BLOB_FILENAME });
  if (blobs.length === 0) {
    return { items: [] };
  }
  // Pick the most recently uploaded blob to avoid reading stale data
  const latest = blobs.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )[0];
  const response = await fetch(latest.url + "?t=" + Date.now(), {
    cache: "no-store",
  });
  return (await response.json()) as ContentIndex;
}

export async function saveContentIndex(index: ContentIndex): Promise<void> {
  // Collect old blobs before writing
  const { blobs: oldBlobs } = await list({ prefix: BLOB_FILENAME });

  // Write new blob first so there's always a valid blob available
  await put(BLOB_FILENAME, JSON.stringify(index), {
    access: "public",
    contentType: "application/json",
  });

  // Then delete old blobs
  for (const blob of oldBlobs) {
    await del(blob.url);
  }
}

export async function addContentItem(item: ContentItem): Promise<void> {
  const index = await getContentIndex();
  index.items.push(item);
  await saveContentIndex(index);
}

export async function updateContentItem(
  id: string,
  updates: Partial<Pick<ContentItem, "title" | "url" | "summary" | "embedding">>
): Promise<void> {
  const index = await getContentIndex();
  const itemIndex = index.items.findIndex((item) => item.id === id);
  if (itemIndex === -1) throw new Error("Content item not found");

  index.items[itemIndex] = {
    ...index.items[itemIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  await saveContentIndex(index);
}

export async function deleteContentItem(id: string): Promise<void> {
  const index = await getContentIndex();
  index.items = index.items.filter((item) => item.id !== id);
  await saveContentIndex(index);
}
