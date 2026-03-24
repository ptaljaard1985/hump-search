import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/summarise";
import { generateEmbedding } from "@/lib/embeddings";
import { addContentItem, getContentIndex, deleteContentItem } from "@/lib/storage";
import { isValidPassword } from "@/lib/auth";
import { ContentType } from "@/lib/types";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, title, url, type, content, summary: providedSummary, mediaType, replaceId } = body as {
    password: string;
    title: string;
    url: string;
    type: ContentType;
    content: string;
    summary?: string;
    mediaType?: string;
    replaceId?: string;
  };

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!title || !url || !type || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Check for duplicates (skip if replacing)
    if (!replaceId) {
      const index = await getContentIndex();
      const titleMatch = index.items.find(
        (item) => item.title.toLowerCase() === title.toLowerCase()
      );
      const urlMatch = index.items.find(
        (item) => item.url.toLowerCase() === url.toLowerCase()
      );

      if (titleMatch || urlMatch) {
        const duplicate = titleMatch || urlMatch;
        const matchType = titleMatch && urlMatch ? "title and URL" : titleMatch ? "title" : "URL";
        return NextResponse.json(
          {
            error: "duplicate",
            message: `An item with the same ${matchType} already exists.`,
            matchType,
            existingItem: {
              id: duplicate!.id,
              title: duplicate!.title,
              url: duplicate!.url,
              type: duplicate!.type,
            },
          },
          { status: 409 }
        );
      }
    }

    // If replacing, delete the old item first
    if (replaceId) {
      await deleteContentItem(replaceId);
    }

    // Generate summary if not provided (or use the edited one)
    const summary = providedSummary || (await generateSummary(content, type, title, mediaType));

    // Generate embedding from the summary
    const embedding = await generateEmbedding(summary);

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

    await addContentItem(item);

    return NextResponse.json({ success: true, item: { ...item, embedding: undefined } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Index content error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
