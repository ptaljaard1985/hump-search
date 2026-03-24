import { NextRequest, NextResponse } from "next/server";
import { getContentIndex, deleteContentItem, updateContentItem } from "@/lib/storage";
import { generateEmbedding } from "@/lib/embeddings";

export const dynamic = "force-dynamic";

export async function GET() {
  const index = await getContentIndex();
  // Return items without embeddings for the admin view
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const items = index.items.map(({ embedding, ...rest }) => rest);
  return NextResponse.json({ items });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { id } = body as { id: string };

  await deleteContentItem(id);
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, title, url, summary } = body as {
    id: string;
    title?: string;
    url?: string;
    summary?: string;
  };

  const updates: Record<string, string | number[]> = {};
  if (title) updates.title = title;
  if (url) updates.url = url;
  if (summary) {
    updates.summary = summary;
    // Regenerate embedding when summary changes
    updates.embedding = await generateEmbedding(summary);
  }

  await updateContentItem(id, updates);
  return NextResponse.json({ success: true });
}
