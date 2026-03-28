// @vitest-environment node

import { GET } from "@/app/api/geo/route";
import * as geoModule from "@/lib/geo";

describe("GET /api/geo", () => {
  it("retorna region y countryCode con cache headers", async () => {
    const spy = vi
      .spyOn(geoModule, "resolveGeoFromHeaders")
      .mockReturnValue({ region: "international", countryCode: "US", source: "vercel-header" });

    const request = new Request("http://localhost:3000/api/geo", {
      headers: {
        "x-vercel-ip-country": "US",
      },
    });

    const response = await GET(request);
    expect(spy).toHaveBeenCalledWith(request.headers);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      region: "international",
      countryCode: "US",
    });
    expect(response.headers.get("Cache-Control")).toBe("s-maxage=3600");
    expect(response.headers.get("Vary")).toBe("X-Vercel-IP-Country");
  });
});
