// @vitest-environment node

import { createSupabaseMock } from "@/tests/utils/supabase-mocks";

const revalidatePath = vi.fn();
const redirect = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});
const createServerSupabaseClient = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/supabase", () => ({
  createServerSupabaseClient,
}));

describe("app/login/actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("retorna error cuando faltan credenciales", async () => {
    const { login } = await import("@/app/login/actions");
    const formData = new FormData();

    await expect(login(formData)).resolves.toEqual({
      error: "Email y contraseña son requeridos",
    });
  });

  it("retorna error amigable cuando auth falla", async () => {
    const supabase = createSupabaseMock();
    supabase.auth.signInWithPassword.mockResolvedValue({ error: { message: "bad" } });
    createServerSupabaseClient.mockResolvedValue({ auth: supabase.auth });
    const { login } = await import("@/app/login/actions");

    const formData = new FormData();
    formData.set("email", "admin@pcoptimize.com");
    formData.set("password", "bad");

    await expect(login(formData)).resolves.toEqual({
      error: "Credenciales inválidas. Verifica tu email y contraseña.",
    });
  });

  it("revalida y redirige en login exitoso", async () => {
    const supabase = createSupabaseMock();
    createServerSupabaseClient.mockResolvedValue({ auth: supabase.auth });
    const { login } = await import("@/app/login/actions");

    const formData = new FormData();
    formData.set("email", "admin@pcoptimize.com");
    formData.set("password", "secret");

    await expect(login(formData)).rejects.toThrow("REDIRECT:/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("logout cierra sesion y redirige a login", async () => {
    const supabase = createSupabaseMock();
    createServerSupabaseClient.mockResolvedValue({ auth: supabase.auth });
    const { logout } = await import("@/app/login/actions");

    await expect(logout()).rejects.toThrow("REDIRECT:/login");
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});
