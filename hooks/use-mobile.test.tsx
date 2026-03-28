import { renderHook } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

describe("hooks/use-mobile", () => {
  it("retorna true en viewport movil y escucha cambios", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 500,
    });

    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        media: "(max-width: 767px)",
        onchange: null,
        addEventListener,
        removeEventListener,
      }),
    );

    const { result, unmount } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
