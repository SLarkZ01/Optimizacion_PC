import { getBaseUrl, getPayPalAccessToken, getPrice } from "@/lib/paypal";
import { jsonResponse, textResponse } from "@/tests/utils/http";

describe("lib/paypal", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("retorna precio por plan y region", () => {
    expect(getPrice("basic", "latam")).toBe(19);
    expect(getPrice("gamer", "international")).toBe(45);
  });

  it("usa fallback para base url local", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("usa NEXT_PUBLIC_APP_URL cuando esta definida", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://pcoptimize.vercel.app");
    expect(getBaseUrl()).toBe("https://pcoptimize.vercel.app");
  });

  it("retorna sandbox o production segun NODE_ENV", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "development");
    const paypalDev = await import("@/lib/paypal");
    expect(paypalDev.getPayPalApiBase()).toContain("sandbox");

    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    const paypalProd = await import("@/lib/paypal");
    expect(paypalProd.getPayPalApiBase()).toBe("https://api-m.paypal.com");
  });

  it("lanza error si faltan credenciales", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "");

    await expect(getPayPalAccessToken()).rejects.toThrow("Faltan credenciales de PayPal");
  });

  it("obtiene access token correctamente", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "client");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "secret");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ access_token: "token-123" }),
    );

    await expect(getPayPalAccessToken()).resolves.toBe("token-123");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("propaga error de PayPal al pedir token", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "client");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "secret");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(textResponse("invalid_client", 401));

    await expect(getPayPalAccessToken()).rejects.toThrow("Error obteniendo access token de PayPal: 401");
  });
});
