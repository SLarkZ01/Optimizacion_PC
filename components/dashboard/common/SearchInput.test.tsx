import { fireEvent, render, screen } from "@testing-library/react";
import SearchInput from "@/components/dashboard/common/SearchInput";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/dashboard/clientes",
  useSearchParams: () => new URLSearchParams("q=ana&page=3"),
}));

describe("SearchInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    push.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("actualiza query con debounce y resetea page", () => {
    render(<SearchInput debounceMs={300} />);

    const input = screen.getByLabelText("Buscar");
    fireEvent.change(input, { target: { value: "carlos" } });

    vi.advanceTimersByTime(299);
    expect(push).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(push).toHaveBeenCalledWith("/dashboard/clientes?q=carlos");
  });

  it("limpia busqueda y elimina query params", () => {
    render(<SearchInput />);
    fireEvent.click(screen.getByLabelText("Limpiar búsqueda"));

    expect(push).toHaveBeenCalledWith("/dashboard/clientes?");
  });
});
