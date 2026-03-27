import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/summarise";
import { ContentType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, content, mediaType } = body as {
      title: string;
      type: ContentType;
      content: string;
      mediaType?: string;
    };

    if (!title || !type || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const summary = await generateSummary(content, type, title, mediaType);
    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Generate summary error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
