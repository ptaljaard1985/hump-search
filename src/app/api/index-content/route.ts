import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/summarise";
import { generateEmbedding } from "@/lib/embeddings";
import { addContentItem } from "@/lib/storage";
import { isValidPassword } from "@/lib/auth";
import { ContentType } from "@/lib/types";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, title, url, type, content, summary: providedSummary } = body as {
    password: string;
    title: string;
    url: string;
    type: ContentType;
    content: string;
    summary?: string;
  };

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!title || !url || !type || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Generate summary if not provided (or use the edited one)
  const summary = providedSummary || (await generateSummary(content, type, title));

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
}
