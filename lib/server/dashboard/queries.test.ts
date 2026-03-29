// @vitest-environment node

import { createSupabaseMock } from "@/tests/utils/supabase-mocks";

const createAdminClient = vi.fn();

vi.mock("@/lib/integrations/supabase", () => ({
  createAdminClient,
}));

describe("lib/dashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("getDashboardKPIs retorna conteos y fallback a 0", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);

    supabase.queue.select("customers", { count: 12 });
    supabase.queue.select("purchases", { count: 4 });
    supabase.queue.select("bookings", { count: null });

    const { getDashboardKPIs } = await import("@/lib/server/dashboard/queries");
    await expect(getDashboardKPIs()).resolves.toEqual({
      totalClientes: 12,
      totalCompras: 4,
      totalReservas: 0,
    });
  });

  it("getDashboardChartData agrega ingresos por plan y mes", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);

    supabase.queue.select("purchases", {
      data: [
        { plan_type: "basic", amount: 19, created_at: "2026-01-01T00:00:00.000Z" },
        {
          plan_type: "gamer",
          amount: 32,
          gross_amount_usd: 32,
          net_amount_usd: 29.97,
          created_at: "2026-01-15T00:00:00.000Z",
        },
        {
          plan_type: "basic",
          amount: 19,
          gross_amount_usd: 19,
          net_amount_usd: 17.67,
          created_at: "2026-02-01T00:00:00.000Z",
        },
      ],
      error: null,
    });
    supabase.queue.select("purchases", {
      data: [
        {
          id: "p-1",
          status: "completed",
          plan_type: "basic",
          amount: 19,
          gross_amount_usd: 19,
          paypal_fee_usd: 1.33,
          net_amount_usd: 17.67,
          created_at: "2026-02-01T00:00:00.000Z",
          customers: { name: "Ana", email: "ana@example.com" },
        },
      ],
      error: null,
    });

    const { getDashboardChartData } = await import("@/lib/server/dashboard/queries");
    const result = await getDashboardChartData();

    expect(result.ingresosTotalesBrutos).toBe(70);
    expect(result.ingresosTotalesNetos).toBeCloseTo(66.64, 2);
    expect(result.comprasPorPlan).toEqual(
      expect.arrayContaining([
        { plan: "basic", total: 2, ingresosBrutos: 38, ingresosNetos: 36.67 },
        { plan: "gamer", total: 1, ingresosBrutos: 32, ingresosNetos: 29.97 },
      ]),
    );
    expect(result.comprasPorMes).toEqual([
      {
        mes: "2026-01",
        total: 2,
        ingresosBrutos: 51,
        ingresosNetos: 48.97,
      },
      {
        mes: "2026-02",
        total: 1,
        ingresosBrutos: 19,
        ingresosNetos: 17.67,
      },
    ]);
    expect(result.comprasRecientes).toHaveLength(1);
  });

  it("getCustomers retorna fallback vacio ante error", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.select("customers", {
      data: null,
      error: { message: "db error" },
      count: 0,
    });

    const { getCustomers } = await import("@/lib/server/dashboard/queries");
    await expect(getCustomers(2, "ana")).resolves.toEqual({
      data: [],
      total: 0,
      page: 2,
      totalPages: 0,
    });
  });

  it("getPurchases normaliza respuesta de RPC", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.rpc("search_purchases", {
      data: [
        {
          id: "p-1",
          customer_id: "c-1",
          paypal_order_id: "o-1",
          paypal_capture_id: "cap-1",
          plan_type: "basic",
          gross_amount_usd: 19,
          paypal_fee_usd: 1.33,
          net_amount_usd: 17.67,
          amount: 19,
          currency: "USD",
          status: "completed",
          created_at: "2026-02-01",
          updated_at: "2026-02-01",
          customer_name: "Ana",
          customer_email: "ana@example.com",
          total_count: 1,
        },
      ],
      error: null,
    });

    const { getPurchases } = await import("@/lib/server/dashboard/queries");
    const result = await getPurchases(1, "ana");

    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.data[0].customers).toEqual({ name: "Ana", email: "ana@example.com" });
  });

  it("getBookings normaliza respuesta de RPC", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.rpc("search_bookings", {
      data: [
        {
          id: "b-1",
          purchase_id: "p-1",
          cal_booking_id: "cal-1",
          scheduled_date: "2026-02-02",
          status: "scheduled",
          rustdesk_id: null,
          notes: null,
          created_at: "2026-02-01",
          updated_at: "2026-02-01",
          purchase_plan_type: "gamer",
          purchase_amount: 32,
          customer_name: "Ana",
          customer_email: "ana@example.com",
          total_count: 1,
        },
      ],
      error: null,
    });

    const { getBookings } = await import("@/lib/server/dashboard/queries");
    const result = await getBookings(1, "ana");

    expect(result.total).toBe(1);
    expect(result.data[0].purchases).toEqual({
      plan_type: "gamer",
      amount: 32,
      customers: { name: "Ana", email: "ana@example.com" },
    });
  });

  it("getCustomerDetails retorna null en error RPC", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.rpc("get_customer_details", {
      data: null,
      error: { message: "rpc error" },
    });

    const { getCustomerDetails } = await import("@/lib/server/dashboard/queries");
    await expect(getCustomerDetails("123e4567-e89b-12d3-a456-426614174000")).resolves.toBeNull();
  });
});
