import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/search";
import { getContentItems, logSearch } from "@/lib/storage";

export const dynamic = "force-dynamic";

const CANARY_QUERY = "Admin search: Client scared of markets";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const items = await getContentItems();
    if (items.length === 0) {
      return NextResponse.json({ ok: false, reason: "empty index" }, { status: 500 });
    }

    const recommendation = await getRecommendations(CANARY_QUERY, items);
    await logSearch(CANARY_QUERY, items.length);

    return NextResponse.json({
      ok: true,
      query: CANARY_QUERY,
      itemCount: items.length,
      recommendationLength: recommendation.length,
      at: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Keepalive search error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
