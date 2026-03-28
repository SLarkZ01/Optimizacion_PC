// @vitest-environment node

const createBrowserClient = vi.fn();
const createServerClient = vi.fn();
const createClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createBrowserClient,
  createServerClient,
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

describe("lib/supabase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
  });

  it("createClient usa browser client con anon key", async () => {
    const mod = await import("@/lib/integrations/supabase");
    mod.createClient();

    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
    );
  });

  it("createServerSupabaseClient crea cliente SSR con cookies", async () => {
    const mod = await import("@/lib/integrations/supabase");
    await mod.createServerSupabaseClient();

    expect(createServerClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({ cookies: expect.any(Object) }),
    );
  });

  it("createAdminClient usa service role y sin persistir session", async () => {
    const mod = await import("@/lib/integrations/supabase");
    mod.createAdminClient();

    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  });
});
