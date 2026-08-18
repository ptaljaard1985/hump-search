import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/search";
import { getContentItems, getSearchLogs } from "@/lib/storage";

export const dynamic = "force-dynamic";

const CANARY_QUERY = "Client scared of markets";

// Number of items sent to Claude for the canary. This is a smoke test of the
// search path, not a real search — it only needs enough content for Claude to
// return a well-formed recommendation. Sending the whole index costs ~14x more
// for no extra signal.
const CANARY_ITEM_COUNT = 5;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    // Touch search_logs so the table sees traffic, without writing a fake row
    // into the member search history.
    const recentLogs = await getSearchLogs(1);

    const items = await getContentItems();
    if (items.length === 0) {
      return NextResponse.json({ ok: false, reason: "empty index" }, { status: 500 });
    }

    const sample = items.slice(0, CANARY_ITEM_COUNT);
    const recommendation = await getRecommendations(CANARY_QUERY, sample);

    return NextResponse.json({
      ok: true,
      query: CANARY_QUERY,
      itemCount: items.length,
      itemsSent: sample.length,
      searchLogsReachable: Array.isArray(recentLogs),
      recommendationLength: recommendation.length,
      at: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Keepalive search error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
