// @vitest-environment node

const getCustomerDetails = vi.fn();

vi.mock("@/lib/dashboard", () => ({
  getCustomerDetails,
}));

describe("lib/actions.getCustomerDetailsAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("retorna null para UUID invalido sin consultar DB", async () => {
    const { getCustomerDetailsAction } = await import("@/lib/actions");

    await expect(getCustomerDetailsAction("not-a-uuid")).resolves.toBeNull();
    expect(getCustomerDetails).not.toHaveBeenCalled();
  });

  it("delegates to getCustomerDetails for UUID valido", async () => {
    const payload = { customer: { id: "id-1" }, purchases: [], bookings: [] };
    getCustomerDetails.mockResolvedValue(payload);
    const { getCustomerDetailsAction } = await import("@/lib/actions");

    await expect(
      getCustomerDetailsAction("123e4567-e89b-12d3-a456-426614174000"),
    ).resolves.toEqual(payload);
    expect(getCustomerDetails).toHaveBeenCalledTimes(1);
  });
});
