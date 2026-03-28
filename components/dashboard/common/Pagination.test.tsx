import { fireEvent, render, screen } from "@testing-library/react";
import Pagination from "@/components/dashboard/common/Pagination";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/dashboard/clientes",
  useSearchParams: () => new URLSearchParams("q=ana&page=2"),
}));

describe("Pagination", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("no renderiza si totalPages <= 1", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} total={10} pageSize={10} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra rango de registros", () => {
    render(<Pagination page={2} totalPages={5} total={42} pageSize={10} />);
    expect(screen.getByText(/Mostrando/i)).toHaveTextContent("11–20");
  });

  it("preserva query y navega al cambiar pagina", () => {
    render(<Pagination page={2} totalPages={5} total={42} pageSize={10} />);
    fireEvent.click(screen.getByRole("button", { name: "Página anterior" }));

    expect(push).toHaveBeenCalledWith("/dashboard/clientes?q=ana");

    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    expect(push).toHaveBeenCalledWith("/dashboard/clientes?q=ana&page=3");
  });
});
