import { NextRequest, NextResponse } from "next/server";
import { getContentItems, deleteContentItem, updateContentItem, getContentItem } from "@/lib/storage";
import { generateEmbedding, buildEmbeddingText } from "@/lib/embeddings";

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
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }
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

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }

    const updates: Record<string, string | number[]> = {};
    if (title !== undefined) updates.title = title;
    if (url !== undefined) updates.url = url;
    if (summary !== undefined) updates.summary = summary;

    // Re-embed if title or summary changed (both are part of the embedding text)
    if (title !== undefined || summary !== undefined) {
      const existing = await getContentItem(id);
      if (!existing) {
        return NextResponse.json({ error: "Content item not found" }, { status: 404 });
      }
      const finalTitle = title ?? existing.title;
      const finalSummary = summary ?? existing.summary;
      updates.embedding = await generateEmbedding(buildEmbeddingText(finalTitle, existing.type, finalSummary));
    }

    await updateContentItem(id, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Update content error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
