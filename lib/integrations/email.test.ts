import { buildCalComUrl, sendBookingConfirmationEmail, sendPaymentConfirmationEmail } from "@/lib/integrations/email";

const sendTransacEmail = vi.fn();

vi.mock("@getbrevo/brevo", () => ({
  BrevoClient: class BrevoClientMock {
    transactionalEmails = {
      sendTransacEmail,
    };
  },
}));

describe("lib/email", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    sendTransacEmail.mockReset();
  });

  it("buildCalComUrl rellena email y name", () => {
    vi.stubEnv("NEXT_PUBLIC_CAL_COM_URL", "https://cal.com/pcoptimize");
    const url = buildCalComUrl("ana@example.com", "Ana Lopez");
    expect(url).toContain("email=ana%40example.com");
    expect(url).toContain("name=Ana+Lopez");
  });

  it("no envia email de pago si BREVO_API_KEY no existe", async () => {
    vi.stubEnv("BREVO_API_KEY", "");

    await expect(
      sendPaymentConfirmationEmail({
        toEmail: "ana@example.com",
        customerName: "Ana",
        planId: "basic",
        amount: 19,
        orderId: "ORDER-1",
      }),
    ).resolves.toBe(false);
  });

  it("envia email de pago cuando Brevo responde ok", async () => {
    vi.stubEnv("BREVO_API_KEY", "key");
    sendTransacEmail.mockResolvedValue({ messageId: "msg-1" });

    await expect(
      sendPaymentConfirmationEmail({
        toEmail: "ana@example.com",
        customerName: "Ana",
        customerEmail: "ana@example.com",
        planId: "basic",
        amount: 19,
        orderId: "ORDER-1",
      }),
    ).resolves.toBe(true);

    expect(sendTransacEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [{ email: "ana@example.com", name: "Ana" }],
      }),
    );
  });

  it("retorna false si Brevo falla en booking email", async () => {
    vi.stubEnv("BREVO_API_KEY", "key");
    sendTransacEmail.mockRejectedValue(new Error("brevo down"));

    await expect(
      sendBookingConfirmationEmail({
        toEmail: "ana@example.com",
        customerName: "Ana",
        scheduledDate: "2026-03-27T10:00:00.000Z",
        calBookingId: "cal-1",
      }),
    ).resolves.toBe(false);
  });
});
