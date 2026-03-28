import {
  countryCodeToRegion,
  normalizeCountryCode,
  resolveGeoFromHeaders,
} from "@/lib/geo";

describe("lib/geo", () => {
  it("normaliza codigo de pais valido", () => {
    expect(normalizeCountryCode(" co ")).toBe("CO");
  });

  it("retorna null para codigo invalido", () => {
    expect(normalizeCountryCode("col")).toBeNull();
    expect(normalizeCountryCode("1A")).toBeNull();
    expect(normalizeCountryCode(null)).toBeNull();
  });

  it("mapea LATAM e internacional correctamente", () => {
    expect(countryCodeToRegion("CO")).toBe("latam");
    expect(countryCodeToRegion("US")).toBe("international");
    expect(countryCodeToRegion(null)).toBe("latam");
  });

  it("resuelve geo desde header de vercel", () => {
    const headers = new Headers({ "x-vercel-ip-country": "mx" });
    const result = resolveGeoFromHeaders(headers);

    expect(result).toEqual({
      region: "latam",
      countryCode: "MX",
      source: "vercel-header",
    });
  });

  it("aplica fallback cuando no hay header valido", () => {
    const headers = new Headers({ "x-vercel-ip-country": "??" });
    const result = resolveGeoFromHeaders(headers);

    expect(result).toEqual({
      region: "latam",
      countryCode: null,
      source: "fallback",
    });
  });
});
