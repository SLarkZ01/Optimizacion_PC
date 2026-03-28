// @vitest-environment node

import { createHmac } from "node:crypto";
import { createSupabaseMock } from "@/tests/utils/supabase-mocks";

const createAdminClient = vi.fn();
const sendBookingConfirmationEmail = vi.fn();
const afterMock = vi.fn((callback: () => unknown) => callback());

vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return {
    ...actual,
    after: afterMock,
  };
});

vi.mock("@/lib/supabase", () => ({
  createAdminClient,
}));

vi.mock("@/lib/email", () => ({
  sendBookingConfirmationEmail,
}));

function signBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("POST /api/webhooks/calcom", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("CALCOM_WEBHOOK_SECRET", "cal-secret");
    sendBookingConfirmationEmail.mockResolvedValue(true);
  });

  it("retorna 401 con firma invalida", async () => {
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = JSON.stringify({ triggerEvent: "BOOKING_CREATED", payload: {} });

    const request = new Request("http://localhost:3000/api/webhooks/calcom", {
      method: "POST",
      headers: {
        "x-cal-signature-256": "invalid",
      },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("procesa BOOKING_CREATED, guarda y envia email", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);

    supabase.queue.select("purchases", {
      data: { id: "purchase-1" },
      error: null,
    });
    supabase.queue.insert("bookings", { data: null, error: null });

    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = JSON.stringify({
      triggerEvent: "BOOKING_CREATED",
      payload: {
        uid: "cal-123",
        title: "Sesion de optimizacion",
        startTime: "2026-03-27T17:00:00.000Z",
        attendees: [
          {
            name: "Juan Perez",
            email: "cliente@example.com",
          },
        ],
      },
      createdAt: "2026-03-27T12:00:00.000Z",
    });

    const request = new Request("http://localhost:3000/api/webhooks/calcom", {
      method: "POST",
      headers: {
        "x-cal-signature-256": signBody(body, "cal-secret"),
      },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true, processed: true });

    expect(supabase.calls.inserts).toContainEqual(
      expect.objectContaining({
        table: "bookings",
        payload: expect.objectContaining({
          purchase_id: "purchase-1",
          cal_booking_id: "cal-123",
          status: "scheduled",
        }),
      }),
    );
    expect(afterMock).toHaveBeenCalledTimes(1);
    expect(sendBookingConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: "cliente@example.com",
        calBookingId: "cal-123",
      }),
    );
  });

  it("ignora eventos no soportados", async () => {
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = JSON.stringify({
      triggerEvent: "BOOKING_PAYMENT_INITIATED",
      payload: {},
      createdAt: "2026-03-27T12:00:00.000Z",
    });

    const request = new Request("http://localhost:3000/api/webhooks/calcom", {
      method: "POST",
      headers: {
        "x-cal-signature-256": signBody(body, "cal-secret"),
      },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true, processed: false });
  });

  it("en BOOKING_CREATED sin email retorna processed false", async () => {
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = JSON.stringify({
      triggerEvent: "BOOKING_CREATED",
      payload: {
        uid: "cal-no-email",
        attendees: [{ name: "Sin Email", email: "" }],
      },
      createdAt: "2026-03-27T12:00:00.000Z",
    });

    const request = new Request("http://localhost:3000/api/webhooks/calcom", {
      method: "POST",
      headers: {
        "x-cal-signature-256": signBody(body, "cal-secret"),
      },
      body,
    });

    const response = await POST(request);
    await expect(response.json()).resolves.toEqual({ received: true, processed: false, reason: "no_email" });
  });

  it("en BOOKING_CREATED maneja duplicado 23505 sin fallar", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.select("purchases", { data: { id: "purchase-2" }, error: null });
    supabase.queue.insert("bookings", {
      data: null,
      error: { code: "23505" },
    });

    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = JSON.stringify({
      triggerEvent: "BOOKING_CREATED",
      payload: {
        uid: "cal-dup",
        startTime: "2026-03-27T17:00:00.000Z",
        attendees: [{ name: "Ana", email: "ana@example.com" }],
      },
      createdAt: "2026-03-27T12:00:00.000Z",
    });

    const request = new Request("http://localhost:3000/api/webhooks/calcom", {
      method: "POST",
      headers: {
        "x-cal-signature-256": signBody(body, "cal-secret"),
      },
      body,
    });

    const response = await POST(request);
    await expect(response.json()).resolves.toEqual({ received: true, processed: true });
  });

  it("BOOKING_RESCHEDULED actualiza booking existente", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.select("bookings", { data: { id: "booking-1" }, error: null });
    supabase.queue.update("bookings", { data: null, error: null });

    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = JSON.stringify({
      triggerEvent: "BOOKING_RESCHEDULED",
      payload: {
        uid: "new-uid",
        rescheduleUid: "old-uid",
        title: "Sesion reagendada",
        startTime: "2026-03-28T17:00:00.000Z",
        attendees: [{ name: "Ana", email: "ana@example.com" }],
      },
      createdAt: "2026-03-27T12:00:00.000Z",
    });

    const request = new Request("http://localhost:3000/api/webhooks/calcom", {
      method: "POST",
      headers: {
        "x-cal-signature-256": signBody(body, "cal-secret"),
      },
      body,
    });

    const response = await POST(request);
    await expect(response.json()).resolves.toEqual({ received: true, processed: true });
    expect(supabase.calls.updates).toContainEqual(
      expect.objectContaining({
        table: "bookings",
        payload: expect.objectContaining({
          status: "scheduled",
          cal_booking_id: "new-uid",
        }),
      }),
    );
  });

  it("BOOKING_CANCELLED actualiza estado cancelado", async () => {
    const supabase = createSupabaseMock();
    createAdminClient.mockReturnValue(supabase.client);
    supabase.queue.update("bookings", { data: null, error: null });

    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = JSON.stringify({
      triggerEvent: "BOOKING_CANCELLED",
      payload: {
        uid: "cal-cancel",
        attendees: [{ name: "Ana", email: "ana@example.com" }],
      },
      createdAt: "2026-03-27T12:00:00.000Z",
    });

    const request = new Request("http://localhost:3000/api/webhooks/calcom", {
      method: "POST",
      headers: {
        "x-cal-signature-256": signBody(body, "cal-secret"),
      },
      body,
    });

    const response = await POST(request);
    await expect(response.json()).resolves.toEqual({ received: true, processed: true });
    expect(supabase.calls.updates).toContainEqual(
      expect.objectContaining({
        table: "bookings",
        payload: { status: "cancelled" },
      }),
    );
  });

  it("retorna 400 cuando body no es JSON valido", async () => {
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = "{invalid-json";
    const request = new Request("http://localhost:3000/api/webhooks/calcom", {
      method: "POST",
      headers: {
        "x-cal-signature-256": signBody(body, "cal-secret"),
      },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Bad Request" });
  });
});
