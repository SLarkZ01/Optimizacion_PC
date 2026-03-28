import { buildDualAxisScales, tickUSD } from "@/lib/dashboard/chart-utils";

describe("lib/chart-utils", () => {
  it("tickUSD formatea valores grandes en k", () => {
    expect(tickUSD(500)).toBe("$500");
    expect(tickUSD(1200)).toBe("$1.2k");
  });

  it("buildDualAxisScales oculta ejes en mobile", () => {
    const scales = buildDualAxisScales(true);
    expect(scales?.yIngresos?.display).toBe(false);
    expect(scales?.yTotal?.display).toBe(false);
  });

  it("buildDualAxisScales muestra ejes en desktop", () => {
    const scales = buildDualAxisScales(false);
    expect(scales?.yIngresos?.display).toBe(true);
    expect(scales?.yTotal?.display).toBe(true);
  });
});
