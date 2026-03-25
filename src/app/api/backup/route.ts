import { NextResponse } from "next/server";
import { getContentIndex } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const index = await getContentIndex();
  const timestamp = new Date().toISOString().split("T")[0];

  return new NextResponse(JSON.stringify(index, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="content-index-backup-${timestamp}.json"`,
    },
  });
}
