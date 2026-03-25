import { put, list } from "@vercel/blob";
import { ContentIndex, ContentItem } from "./types";

const BLOB_FILENAME = "content-index.json";

export async function getContentIndex(): Promise<ContentIndex> {
  const { blobs } = await list({ prefix: BLOB_FILENAME });
  if (blobs.length === 0) {
    return { items: [] };
  }
  const response = await fetch(blobs[0].url + "?t=" + Date.now(), {
    cache: "no-store",
  });
  return (await response.json()) as ContentIndex;
}

export async function saveContentIndex(index: ContentIndex): Promise<void> {
  await put(BLOB_FILENAME, JSON.stringify(index), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
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
