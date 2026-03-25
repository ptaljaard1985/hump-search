import { list, del, put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BLOB_FILENAME = "content-index.json";

// GET: list all content-index blobs
export async function GET() {
  const { blobs } = await list({ prefix: "content-index" });

  const results = [];
  for (const blob of blobs) {
    try {
      const response = await fetch(blob.url + "?t=" + Date.now(), {
        cache: "no-store",
      });
      const data = await response.json();
      results.push({
        pathname: blob.pathname,
        uploadedAt: blob.uploadedAt,
        itemCount: data.items?.length ?? 0,
      });
    } catch {
      results.push({
        pathname: blob.pathname,
        uploadedAt: blob.uploadedAt,
        itemCount: "error reading",
      });
    }
  }

  return NextResponse.json({ blobs: results });
}

// POST: restore from the blob with the most items, then clean up orphans
export async function POST() {
  const { blobs } = await list({ prefix: "content-index" });

  // Find the blob with the most items
  let bestBlob = null;
  let bestData = null;
  let bestCount = 0;

  for (const blob of blobs) {
    try {
      const response = await fetch(blob.url + "?t=" + Date.now(), {
        cache: "no-store",
      });
      const data = await response.json();
      const count = data.items?.length ?? 0;
      if (count > bestCount) {
        bestCount = count;
        bestBlob = blob;
        bestData = data;
      }
    } catch {
      // skip unreadable blobs
    }
  }

  if (!bestData || bestCount === 0) {
    return NextResponse.json({ error: "No recoverable data found" }, { status: 404 });
  }

  // Write recovered data to the canonical blob
  await put(BLOB_FILENAME, JSON.stringify(bestData), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  // Delete all orphaned blobs (random-suffixed ones)
  for (const blob of blobs) {
    if (blob.pathname !== BLOB_FILENAME) {
      await del(blob.url);
    }
  }

  return NextResponse.json({
    restored: bestCount,
    fromBlob: bestBlob!.pathname,
    cleanedUp: blobs.filter((b) => b.pathname !== BLOB_FILENAME).length,
  });
}
