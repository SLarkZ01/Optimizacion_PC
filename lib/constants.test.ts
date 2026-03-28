import {
  FAQ_ITEMS,
  FEATURES,
  NAV_LINKS,
  PAYMENT_STATUS_CONFIG,
  PLAN_COLORS,
  PLAN_NAMES,
  PRICING_PLANS,
  PROCESS_STEPS,
  SITE_CONFIG,
  STATS,
  TESTIMONIALS,
} from "@/lib/constants";

describe("lib/constants", () => {
  it("expone configuracion base del sitio", () => {
    expect(SITE_CONFIG.name).toBe("PCOptimize");
    expect(SITE_CONFIG.contact.whatsapp).toMatch(/^\+\d+$/);
  });

  it("define dos planes con ids esperados", () => {
    expect(PRICING_PLANS.map((p) => p.id)).toEqual(["basic", "gamer"]);
  });

  it("mantiene estructuras de secciones principales", () => {
    expect(FEATURES.length).toBeGreaterThanOrEqual(6);
    expect(PROCESS_STEPS.length).toBe(4);
    expect(TESTIMONIALS.length).toBeGreaterThanOrEqual(4);
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(6);
  });

  it("mapea nombres y colores de planes", () => {
    expect(PLAN_NAMES.basic).toBeTruthy();
    expect(PLAN_COLORS.gamer).toContain("--color-chart");
  });

  it("expone links de navegacion, stats y estados de pago", () => {
    expect(NAV_LINKS.some((link) => link.href === "#precios")).toBe(true);
    expect(STATS.length).toBe(3);
    expect(PAYMENT_STATUS_CONFIG.refunded.label).toBe("Reembolsado");
  });
});
