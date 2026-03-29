// @vitest-environment node

const getPricingMatrix = vi.fn();

vi.mock("@/lib/server/pricing/queries", () => ({
  getPricingMatrix,
}));

describe("GET /api/pricing", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getPricingMatrix.mockReset();
  });

  it("retorna pricing matrix", async () => {
    getPricingMatrix.mockResolvedValue({
      basic: { latam: 19, international: 30 },
      gamer: { latam: 32, international: 45 },
    });

    const { GET } = await import("@/app/api/pricing/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      pricing: {
        basic: { latam: 19, international: 30 },
        gamer: { latam: 32, international: 45 },
      },
    });
  });

  it("retorna 500 si falla", async () => {
    getPricingMatrix.mockRejectedValue(new Error("boom"));

    const { GET } = await import("@/app/api/pricing/route");
    const response = await GET();

    expect(response.status).toBe(500);
  });
});
