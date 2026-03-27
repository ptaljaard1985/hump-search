import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/summarise";
import { generateEmbedding, buildEmbeddingText } from "@/lib/embeddings";
import { addContentItem, replaceContentItem, checkDuplicate } from "@/lib/storage";
import { ContentType } from "@/lib/types";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, type, content, summary: providedSummary, replaceId } = body as {
      title: string;
      url: string;
      type: ContentType;
      content: string;
      summary?: string;
      replaceId?: string;
    };

    if (!title || !url || !type || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    // Check for duplicates (skip if replacing)
    if (!replaceId) {
      const duplicate = await checkDuplicate(title, url, type === "pdf-guide");
      if (duplicate) {
        return NextResponse.json(
          {
            error: "duplicate",
            message: `An item with the same ${duplicate.matchType} already exists.`,
            matchType: duplicate.matchType,
            existingItem: duplicate.item,
          },
          { status: 409 }
        );
      }
    }

    // Build the complete item BEFORE touching the index
    const summary = providedSummary || (await generateSummary(content, type, title));
    const embedding = await generateEmbedding(buildEmbeddingText(title, type, summary));

    const item = {
      id: crypto.randomUUID(),
      title,
      url,
      type,
      summary,
      embedding,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Single read-modify-write: replace or add
    if (replaceId) {
      await replaceContentItem(replaceId, item);
    } else {
      await addContentItem(item);
    }

    return NextResponse.json({ success: true, item: { ...item, embedding: undefined } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Index content error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
