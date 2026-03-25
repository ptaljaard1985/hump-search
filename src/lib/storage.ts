import { put, list, del } from "@vercel/blob";
import { ContentIndex, ContentItem } from "./types";

const BLOB_FILENAME = "content-index.json";
const BACKUP_PREFIX = "backups/content-index-";
const MAX_BACKUPS = 5;

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
  const data = JSON.stringify(index);

  // Auto-backup before saving (only if there are items to protect)
  if (index.items.length > 0) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await put(`${BACKUP_PREFIX}${timestamp}.json`, data, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    // Prune old backups, keep only the most recent
    const { blobs: backups } = await list({ prefix: BACKUP_PREFIX });
    const sorted = backups.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    for (const old of sorted.slice(MAX_BACKUPS)) {
      await del(old.url);
    }
  }

  await put(BLOB_FILENAME, data, {
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
