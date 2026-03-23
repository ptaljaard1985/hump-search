import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, findSimilarContent } from "@/lib/embeddings";
import { getRecommendations } from "@/lib/search";
import { getContentIndex } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query } = body as { query: string };

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const index = await getContentIndex();

  if (index.items.length === 0) {
    return NextResponse.json({
      recommendation: "The content library is empty. Please index some content first.",
    });
  }

  // Stage 1: Vector search — find top 10 candidates
  const queryEmbedding = await generateEmbedding(query);
  const candidates = findSimilarContent(queryEmbedding, index.items, 10);

  // Stage 2: Claude recommendation from candidates
  const recommendation = await getRecommendations(query, candidates);

  // Verify URLs — strip any that aren't in our index
  const validUrls = new Set(index.items.map((item) => item.url));
  const urlPattern = /https?:\/\/[^\s)]+/g;
  const mentionedUrls = recommendation.match(urlPattern) || [];
  const hasInvalidUrl = mentionedUrls.some((url) => !validUrls.has(url));

  return NextResponse.json({
    recommendation,
    hasInvalidUrl,
    candidateCount: candidates.length,
  });
}
