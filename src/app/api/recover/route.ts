import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // List ALL blobs with a broad prefix to find orphaned content-index blobs
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
