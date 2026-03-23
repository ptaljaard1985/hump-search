import { NextRequest, NextResponse } from "next/server";
import { getContentIndex, deleteContentItem, updateContentItem } from "@/lib/storage";
import { generateEmbedding } from "@/lib/embeddings";
import { isValidPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password") || "";

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const index = await getContentIndex();
  // Return items without embeddings for the admin view
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const items = index.items.map(({ embedding, ...rest }) => rest);
  return NextResponse.json({ items });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { password, id } = body as { password: string; id: string };

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteContentItem(id);
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { password, id, title, url, summary } = body as {
    password: string;
    id: string;
    title?: string;
    url?: string;
    summary?: string;
  };

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
