import { NextResponse } from "next/server";
import { resolveGeoFromHeaders } from "@/lib/geo";

export async function GET(request: Request) {
  const geo = resolveGeoFromHeaders(request.headers);

  return NextResponse.json(
    {
      region: geo.region,
      countryCode: geo.countryCode,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=3600",
        "Vary": "X-Vercel-IP-Country",
      },
    }
  );
}
