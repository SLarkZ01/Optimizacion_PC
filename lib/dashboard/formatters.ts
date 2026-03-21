const countryDisplayNames = new Intl.DisplayNames(["es"], { type: "region" });

export function countryCodeToFlagUrl(code: string): string {
  const points = code
    .toUpperCase()
    .split("")
    .map((char) => (0x1f1e6 + char.charCodeAt(0) - 65).toString(16));
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${points.join("-")}.svg`;
}

export function countryCodeToName(code: string): string {
  try {
    return countryDisplayNames.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}
