// @vitest-environment node

import { createSupabaseMock } from "@/tests/utils/supabase-mocks";

const createAdminClient = vi.fn();

vi.mock("@/lib/integrations/supabase", () => ({
  createAdminClient,
}));

describe("lib/server/pricing/queries", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("retorna fallback cuando pricing_rules falla", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.select("pricing_rules", {
      data: null,
      error: { message: "db error" },
    });

    const { getPricingMatrix } = await import("@/lib/server/pricing/queries");
    const pricing = await getPricingMatrix();

    expect(pricing.basic.latam).toBe(19);
    expect(pricing.gamer.international).toBe(45);
  });

  it("usa valores de DB cuando existen", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.select("pricing_rules", {
      data: [
        {
          id: "r1",
          plan_type: "basic",
          region: "latam",
          price_usd: 21,
          currency: "USD",
          updated_by: null,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "r2",
          plan_type: "gamer",
          region: "international",
          price_usd: 49,
          currency: "USD",
          updated_by: null,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ],
      error: null,
    });

    const { getPricingMatrix } = await import("@/lib/server/pricing/queries");
    const pricing = await getPricingMatrix();

    expect(pricing.basic.latam).toBe(21);
    expect(pricing.basic.international).toBe(30);
    expect(pricing.gamer.international).toBe(49);
  });
});
