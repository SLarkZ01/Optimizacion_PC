// @vitest-environment node

const exchangeCodeForSession = vi.fn();
const createServerSupabaseClient = vi.fn();

vi.mock("@/lib/supabase", () => ({
  createServerSupabaseClient,
}));

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    exchangeCodeForSession.mockResolvedValue({ error: null });
    createServerSupabaseClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession,
      },
    });
  });

  it("intercambia code y redirige a next", async () => {
    const { GET } = await import("@/app/auth/callback/route");
    const request = new Request("https://pcoptimize.vercel.app/auth/callback?code=abc&next=/dashboard/compras");

    const response = await GET(request);
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://pcoptimize.vercel.app/dashboard/compras");
  });

  it("redirige a login cuando falla intercambio", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: "invalid" } });
    const { GET } = await import("@/app/auth/callback/route");
    const request = new Request("https://pcoptimize.vercel.app/auth/callback?code=abc");

    const response = await GET(request);
    expect(response.headers.get("location")).toBe("https://pcoptimize.vercel.app/login?error=auth");
  });

  it("redirige a login cuando no hay code", async () => {
    const { GET } = await import("@/app/auth/callback/route");
    const request = new Request("https://pcoptimize.vercel.app/auth/callback");

    const response = await GET(request);
    expect(createServerSupabaseClient).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://pcoptimize.vercel.app/login?error=auth");
  });
});
