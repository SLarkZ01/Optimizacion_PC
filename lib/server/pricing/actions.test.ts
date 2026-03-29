// @vitest-environment node

import { createSupabaseMock } from "@/tests/utils/supabase-mocks";

const revalidatePath = vi.fn();
const createAdminClient = vi.fn();
const createServerSupabaseClient = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/integrations/supabase", () => ({
  createAdminClient,
  createServerSupabaseClient,
}));

describe("lib/server/pricing/actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("retorna error si no hay sesión", async () => {
    createServerSupabaseClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const { updatePricingRulesAction } = await import("@/lib/server/pricing/actions");

    const formData = new FormData();
    formData.set("basic_latam", "19");
    formData.set("basic_international", "30");
    formData.set("gamer_latam", "32");
    formData.set("gamer_international", "45");

    const result = await updatePricingRulesAction({ success: false, message: "" }, formData);
    expect(result.success).toBe(false);
    expect(result.message).toContain("Sesión inválida");
  });

  it("actualiza precios con valores válidos", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.upsert("pricing_rules", { data: null, error: null });

    createServerSupabaseClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
    });

    const { updatePricingRulesAction } = await import("@/lib/server/pricing/actions");

    const formData = new FormData();
    formData.set("basic_latam", "20");
    formData.set("basic_international", "31");
    formData.set("gamer_latam", "33");
    formData.set("gamer_international", "46");

    const result = await updatePricingRulesAction({ success: false, message: "" }, formData);

    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/precios");
  });
});
