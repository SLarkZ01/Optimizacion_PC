import { countryCodeToFlagUrl, countryCodeToName } from "@/lib/dashboard/formatters";

describe("lib/dashboard/formatters", () => {
  it("countryCodeToFlagUrl construye url de twemoji", () => {
    expect(countryCodeToFlagUrl("co")).toContain("1f1e8-1f1f4.svg");
  });

  it("countryCodeToName retorna nombre cuando es valido", () => {
    expect(countryCodeToName("CO")).toMatch(/Colombia/i);
  });

  it("countryCodeToName retorna codigo fallback ante valor invalido", () => {
    expect(countryCodeToName("???")).toBe("???");
  });
});
