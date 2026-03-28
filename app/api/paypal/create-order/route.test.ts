// @vitest-environment node

import { jsonResponse } from "@/tests/utils/http";

const getPayPalAccessToken = vi.fn();
const getPayPalApiBase = vi.fn();
const getPrice = vi.fn();
const resolveGeoFromHeaders = vi.fn();

vi.mock("@/lib/paypal", () => ({
  getPayPalAccessToken,
  getPayPalApiBase,
  getPrice,
  PLAN_NAMES: {
    basic: "PCOptimize - Plan Basico",
    gamer: "PCOptimize - Plan Gamer",
  },
}));

vi.mock("@/lib/geo", () => ({
  resolveGeoFromHeaders,
}));

describe("POST /api/paypal/create-order", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getPayPalAccessToken.mockResolvedValue("token-123");
    getPayPalApiBase.mockReturnValue("https://api-m.sandbox.paypal.com");
    getPrice.mockReturnValue(19);
    resolveGeoFromHeaders.mockReturnValue({ region: "latam", countryCode: "CO", source: "vercel-header" });
  });

  it("retorna 400 cuando falta planId", async () => {
    const { POST } = await import("@/app/api/paypal/create-order/route");
    const request = new Request("http://localhost:3000/api/paypal/create-order", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Se requiere planId" });
  });

  it("retorna 400 cuando plan es invalido", async () => {
    const { POST } = await import("@/app/api/paypal/create-order/route");
    const request = new Request("http://localhost:3000/api/paypal/create-order", {
      method: "POST",
      body: JSON.stringify({ planId: "premium" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toContain("Plan inválido");
  });

  it("crea orden en PayPal y retorna orderID", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ id: "ORDER-123" }),
    );
    const { POST } = await import("@/app/api/paypal/create-order/route");

    const request = new Request("http://localhost:3000/api/paypal/create-order", {
      method: "POST",
      body: JSON.stringify({ planId: "basic" }),
      headers: { "Content-Type": "application/json", "x-vercel-ip-country": "CO" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ orderID: "ORDER-123" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.purchase_units[0].amount.value).toBe("19.00");
    expect(body.purchase_units[0].custom_id).toContain('"country_code":"CO"');
  });

  it("retorna 500 si PayPal devuelve error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ message: "bad request" }, { status: 400 }));
    const { POST } = await import("@/app/api/paypal/create-order/route");

    const request = new Request("http://localhost:3000/api/paypal/create-order", {
      method: "POST",
      body: JSON.stringify({ planId: "basic" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "No se pudo crear la orden de PayPal" });
  });
});
