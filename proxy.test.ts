// @vitest-environment node

import { NextRequest } from "next/server";

const getUser = vi.fn();
const createServerClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient,
}));

describe("proxy auth guards", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getUser.mockResolvedValue({ data: { user: null } });
    createServerClient.mockReturnValue({
      auth: { getUser },
    });
  });

  it("redirige a login cuando ruta protegida no tiene sesion", async () => {
    const { proxy } = await import("@/proxy");
    const request = new NextRequest("http://localhost:3000/dashboard/compras");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?redirectTo=%2Fdashboard%2Fcompras");
  });

  it("redirige a dashboard cuando usuario autenticado visita /login", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const { proxy } = await import("@/proxy");
    const request = new NextRequest("http://localhost:3000/login");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("continua request para ruta publica", async () => {
    const { proxy } = await import("@/proxy");
    const request = new NextRequest("http://localhost:3000/");

    const response = await proxy(request);

    expect(response.status).toBe(200);
  });
});
