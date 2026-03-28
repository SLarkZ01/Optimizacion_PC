// @vitest-environment node

import { createSupabaseMock } from "@/tests/utils/supabase-mocks";
import { jsonResponse } from "@/tests/utils/http";

const getPayPalAccessToken = vi.fn();
const getPayPalApiBase = vi.fn();
const createAdminClient = vi.fn();

vi.mock("@/lib/paypal", () => ({
  getPayPalAccessToken,
  getPayPalApiBase,
}));

vi.mock("@/lib/supabase", () => ({
  createAdminClient,
}));

describe("POST /api/webhooks/paypal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("PAYPAL_WEBHOOK_ID", "webhook-id");
    getPayPalAccessToken.mockResolvedValue("token-123");
    getPayPalApiBase.mockReturnValue("https://api-m.sandbox.paypal.com");
  });

  it("retorna 400 cuando la firma no es valida", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ verification_status: "FAILURE" }),
    );
    const { POST } = await import("@/app/api/webhooks/paypal/route");

    const body = JSON.stringify({ event_type: "PAYMENT.CAPTURE.COMPLETED", resource: {} });
    const request = new Request("http://localhost:3000/api/webhooks/paypal", {
      method: "POST",
      headers: {
        "paypal-auth-algo": "algo",
        "paypal-cert-url": "https://cert",
        "paypal-transmission-id": "id",
        "paypal-transmission-sig": "sig",
        "paypal-transmission-time": "time",
      },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Firma de webhook inválida" });
  });

  it("actualiza estado en evento de refund", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ verification_status: "SUCCESS" }),
    );
    const { POST } = await import("@/app/api/webhooks/paypal/route");

    const body = JSON.stringify({
      event_type: "PAYMENT.CAPTURE.REFUNDED",
      resource: {
        id: "CAP-1",
      },
    });
    const request = new Request("http://localhost:3000/api/webhooks/paypal", {
      method: "POST",
      headers: {
        "paypal-auth-algo": "algo",
        "paypal-cert-url": "https://cert",
        "paypal-transmission-id": "id",
        "paypal-transmission-sig": "sig",
        "paypal-transmission-time": "time",
      },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });

    expect(supabase.calls.updates).toContainEqual(
      expect.objectContaining({
        table: "purchases",
        payload: { status: "refunded" },
      }),
    );
  });

  it("retorna 200 para evento no manejado con firma valida", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ verification_status: "SUCCESS" }),
    );
    const { POST } = await import("@/app/api/webhooks/paypal/route");

    const request = new Request("http://localhost:3000/api/webhooks/paypal", {
      method: "POST",
      headers: {
        "paypal-auth-algo": "algo",
        "paypal-cert-url": "https://cert",
        "paypal-transmission-id": "id",
        "paypal-transmission-sig": "sig",
        "paypal-transmission-time": "time",
      },
      body: JSON.stringify({ event_type: "UNKNOWN.EVENT", resource: {} }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
  });

  it("en PAYMENT.CAPTURE.COMPLETED actualiza capture_id si la orden ya existe", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.select("purchases", { data: { id: "purchase-1" }, error: null });
    supabase.queue.update("purchases", { data: null, error: null });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ verification_status: "SUCCESS" }),
    );

    const { POST } = await import("@/app/api/webhooks/paypal/route");

    const request = new Request("http://localhost:3000/api/webhooks/paypal", {
      method: "POST",
      headers: {
        "paypal-auth-algo": "algo",
        "paypal-cert-url": "https://cert",
        "paypal-transmission-id": "id",
        "paypal-transmission-sig": "sig",
        "paypal-transmission-time": "time",
      },
      body: JSON.stringify({
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "CAPTURE-10",
          amount: { value: "19.00" },
          supplementary_data: {
            related_ids: {
              order_id: "ORDER-10",
            },
          },
        },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(supabase.calls.updates).toContainEqual(
      expect.objectContaining({
        table: "purchases",
        payload: { paypal_capture_id: "CAPTURE-10", status: "completed" },
      }),
    );
  });

  it("retorna 400 si falta PAYPAL_WEBHOOK_ID", async () => {
    vi.stubEnv("PAYPAL_WEBHOOK_ID", "");
    const { POST } = await import("@/app/api/webhooks/paypal/route");

    const request = new Request("http://localhost:3000/api/webhooks/paypal", {
      method: "POST",
      headers: {
        "paypal-auth-algo": "algo",
        "paypal-cert-url": "https://cert",
        "paypal-transmission-id": "id",
        "paypal-transmission-sig": "sig",
        "paypal-transmission-time": "time",
      },
      body: JSON.stringify({ event_type: "PAYMENT.CAPTURE.COMPLETED", resource: {} }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
