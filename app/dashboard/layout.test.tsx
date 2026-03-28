// @vitest-environment node

import { renderToStaticMarkup } from "react-dom/server";

const redirect = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});
const createServerSupabaseClient = vi.fn();

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/integrations/supabase", () => ({
  createServerSupabaseClient,
}));

vi.mock("@/components/dashboard/layout/DashboardSidebar", () => ({
  default: function DashboardSidebarMock() {
    return <aside data-testid="dashboard-sidebar" />;
  },
}));

vi.mock("@/components/dashboard/layout/DashboardHeader", () => ({
  default: function DashboardHeaderMock() {
    return <header data-testid="dashboard-header" />;
  },
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-provider">{children}</div>,
  SidebarInset: ({ children }: { children: React.ReactNode }) => <section data-testid="sidebar-inset">{children}</section>,
}));

describe("app/dashboard/layout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("redirige a /login si no hay usuario", async () => {
    createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const { default: DashboardLayout } = await import("@/app/dashboard/layout");

    await expect(
      DashboardLayout({ children: <div>content</div> }),
    ).rejects.toThrow("REDIRECT:/login");
  });

  it("renderiza layout cuando existe sesion", async () => {
    createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
    });

    const { default: DashboardLayout } = await import("@/app/dashboard/layout");
    const element = await DashboardLayout({ children: <div>contenido dashboard</div> });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("dashboard-sidebar");
    expect(html).toContain("dashboard-header");
    expect(html).toContain("contenido dashboard");
  });
});
