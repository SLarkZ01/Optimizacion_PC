import { cn, scrollToSection } from "@/lib/utils";

describe("lib/utils", () => {
  it("cn combina y mergea clases tailwind", () => {
    expect(cn("p-2", "text-sm", "p-4")).toBe("text-sm p-4");
  });

  it("scrollToSection hace scroll cuando existe elemento", () => {
    const scrollIntoView = vi.fn();
    const querySpy = vi.spyOn(document, "querySelector").mockReturnValue({
      scrollIntoView,
    } as unknown as Element);

    scrollToSection("#precios");

    expect(querySpy).toHaveBeenCalledWith("#precios");
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("scrollToSection no falla si no existe elemento", () => {
    vi.spyOn(document, "querySelector").mockReturnValue(null);
    expect(() => scrollToSection("#missing")).not.toThrow();
  });
});
