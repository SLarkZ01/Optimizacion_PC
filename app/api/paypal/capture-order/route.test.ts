// @vitest-environment node

import { createSupabaseMock } from "@/tests/utils/supabase-mocks";
import { jsonResponse } from "@/tests/utils/http";

const getPayPalAccessToken = vi.fn();
const getPayPalApiBase = vi.fn();
const getBaseUrl = vi.fn();
const sendPaymentConfirmationEmail = vi.fn();
const createAdminClient = vi.fn();
const afterMock = vi.fn((callback: () => unknown) => callback());

vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return {
    ...actual,
    after: afterMock,
  };
});

vi.mock("@/lib/integrations/paypal", () => ({
  getPayPalAccessToken,
  getPayPalApiBase,
  getBaseUrl,
}));

vi.mock("@/lib/integrations/email", () => ({
  sendPaymentConfirmationEmail,
}));

vi.mock("@/lib/integrations/supabase", () => ({
  createAdminClient,
}));

describe("POST /api/paypal/capture-order", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getPayPalAccessToken.mockResolvedValue("token-123");
    getPayPalApiBase.mockReturnValue("https://api-m.sandbox.paypal.com");
    getBaseUrl.mockReturnValue("http://localhost:3000");
    sendPaymentConfirmationEmail.mockResolvedValue(true);
  });

  it("retorna 400 si falta orderID", async () => {
    const { POST } = await import("@/app/api/paypal/capture-order/route");

    const request = new Request("http://localhost:3000/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Se requiere orderID" });
  });

  it("retorna 500 si falla captura en PayPal", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ message: "capture error" }, { status: 500 }),
    );
    const { POST } = await import("@/app/api/paypal/capture-order/route");

    const request = new Request("http://localhost:3000/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: "ORDER-1" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "No se pudo capturar el pago de PayPal" });
  });

  it("retorna 400 cuando status no es COMPLETED", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        status: "PENDING",
      }),
    );
    const { POST } = await import("@/app/api/paypal/capture-order/route");

    const request = new Request("http://localhost:3000/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: "ORDER-2" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toContain("Pago no completado");
  });

  it("procesa captura completada con cliente existente, compra y email", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);

    supabase.queue.select("customers", {
      data: { id: "customer-1", country_code: null },
      error: null,
    });
    supabase.queue.update("customers", { data: null, error: null });
    supabase.queue.insert("purchases", { data: null, error: null });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        status: "COMPLETED",
        payer: {
          email_address: "cliente@example.com",
          name: {
            given_name: "Juan",
            surname: "Perez",
          },
          address: {
            country_code: "CO",
          },
        },
        purchase_units: [
          {
            custom_id: JSON.stringify({
              plan_id: "gamer",
              region: "latam",
              country_code: "CO",
              country_source: "vercel-header",
            }),
            payments: {
              captures: [
                {
                  id: "CAPTURE-1",
                  amount: { value: "32.00" },
                },
              ],
            },
          },
        ],
      }),
    );

    const { POST } = await import("@/app/api/paypal/capture-order/route");
    const request = new Request("http://localhost:3000/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: "ORDER-3" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      orderID: "ORDER-3",
      redirectUrl: "http://localhost:3000/exito?order_id=ORDER-3",
    });

    expect(supabase.calls.updates).toContainEqual(
      expect.objectContaining({
        table: "customers",
        payload: { country_code: "CO" },
      }),
    );
    expect(supabase.calls.inserts).toContainEqual(
      expect.objectContaining({
        table: "purchases",
        payload: expect.objectContaining({
          customer_id: "customer-1",
          paypal_order_id: "ORDER-3",
          paypal_capture_id: "CAPTURE-1",
          plan_type: "gamer",
          amount: 32,
          status: "completed",
        }),
      }),
    );
    expect(afterMock).toHaveBeenCalledTimes(1);
    expect(sendPaymentConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: "cliente@example.com",
        planId: "gamer",
      }),
    );
  });

  it("retorna success con warning cuando falla crear customer nuevo", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);

    supabase.queue.select("customers", { data: null, error: null });
    supabase.queue.insert("customers", {
      data: null,
      error: { message: "insert error" },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        status: "COMPLETED",
        payer: {
          email_address: "nuevo@example.com",
          address: { country_code: "CO" },
        },
        purchase_units: [
          {
            custom_id: JSON.stringify({ plan_id: "basic" }),
            payments: {
              captures: [{ id: "CAPTURE-2", amount: { value: "19.00" } }],
            },
          },
        ],
      }),
    );

    const { POST } = await import("@/app/api/paypal/capture-order/route");
    const request = new Request("http://localhost:3000/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: "ORDER-4" }),
    });

    const response = await POST(request);
    await expect(response.json()).resolves.toEqual({
      success: true,
      orderID: "ORDER-4",
      redirectUrl: "http://localhost:3000/exito?order_id=ORDER-4",
      warning: "Pago capturado pero hubo un error guardando el registro",
    });
  });

  it("continua exitoso cuando falla insertar purchase", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);

    supabase.queue.select("customers", {
      data: { id: "customer-2", country_code: "US" },
      error: null,
    });
    supabase.queue.insert("purchases", {
      data: null,
      error: { message: "purchase error" },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        status: "COMPLETED",
        payer: {
          email_address: "cliente2@example.com",
          name: { given_name: "Maria", surname: "Lopez" },
          address: { country_code: "US" },
        },
        purchase_units: [
          {
            custom_id: "invalid-json",
            payments: {
              captures: [{ id: "CAPTURE-3", amount: { value: "19.00" } }],
            },
          },
        ],
      }),
    );

    const { POST } = await import("@/app/api/paypal/capture-order/route");
    const request = new Request("http://localhost:3000/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: "ORDER-5" }),
    });

    const response = await POST(request);
    await expect(response.json()).resolves.toEqual({
      success: true,
      orderID: "ORDER-5",
      redirectUrl: "http://localhost:3000/exito?order_id=ORDER-5",
    });
    expect(sendPaymentConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "basic",
      }),
    );
  });

  it("retorna success aunque no llegue email del payer", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        status: "COMPLETED",
        payer: {
          name: { given_name: "No", surname: "Mail" },
        },
        purchase_units: [
          {
            payments: {
              captures: [{ id: "CAPTURE-4", amount: { value: "19.00" } }],
            },
          },
        ],
      }),
    );

    const { POST } = await import("@/app/api/paypal/capture-order/route");
    const request = new Request("http://localhost:3000/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: "ORDER-6" }),
    });

    const response = await POST(request);
    await expect(response.json()).resolves.toEqual({
      success: true,
      orderID: "ORDER-6",
      redirectUrl: "http://localhost:3000/exito?order_id=ORDER-6",
    });
    expect(supabase.calls.inserts).toHaveLength(0);
    expect(sendPaymentConfirmationEmail).not.toHaveBeenCalled();
  });
});
