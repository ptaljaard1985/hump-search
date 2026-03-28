import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/search";
import { getContentItems, logSearch } from "@/lib/storage";

const ALLOWED_ORIGINS = [
  "https://www.humansundermanagement.com",
  "https://humansundermanagement.com",
  "https://hump-search-git-main-pierre-simplewealths-projects.vercel.app",
];

function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  try {
    const body = await request.json();
    const { query } = body as { query: string };

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400, headers: corsHeaders(origin) });
    }

    const items = await getContentItems();

    if (items.length === 0) {
      return NextResponse.json(
        { recommendation: "The content library is empty. Please index some content first." },
        { headers: corsHeaders(origin) }
      );
    }

    // Send all items to Claude for recommendation
    const recommendation = await getRecommendations(query, items);

    // Log the search
    await logSearch(query, items.length);

    // Verify URLs — strip any that aren't in our index
    const validUrls = new Set(items.map((item) => item.url));
    const urlPattern = /https?:\/\/[^\s)]+/g;
    const mentionedUrls = recommendation.match(urlPattern) || [];
    const hasInvalidUrl = mentionedUrls.some((url) => !validUrls.has(url));

    return NextResponse.json(
      { recommendation, hasInvalidUrl, itemCount: items.length },
      { headers: corsHeaders(origin) }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Search error:", message);
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders(origin) });
  }
}
