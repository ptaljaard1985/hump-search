import { NextRequest, NextResponse } from "next/server";
import { getContentItems, deleteContentItem, updateContentItem } from "@/lib/storage";
import { generateEmbedding } from "@/lib/embeddings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getContentItems();
    return NextResponse.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Get content error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body as { id: string };
    await deleteContentItem(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Delete content error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
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
      updates.embedding = await generateEmbedding(summary);
    }

    await updateContentItem(id, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Update content error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
