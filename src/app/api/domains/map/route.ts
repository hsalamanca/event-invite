import { NextResponse } from "next/server";
import { domainToSlugMap } from "@/lib/domain-store";

/** Lightweight map for middleware host rewrites. */
export async function GET() {
  const map = await domainToSlugMap();
  return NextResponse.json(
    { map },
    {
      headers: {
        "Cache-Control": "s-maxage=10, stale-while-revalidate=30",
      },
    }
  );
}
