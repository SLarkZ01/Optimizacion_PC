import { act, renderHook, waitFor } from "@testing-library/react";
import { useRegion } from "@/hooks/useCurrency";
import { jsonResponse } from "@/tests/utils/http";

describe("hooks/useCurrency", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorage.clear();
  });

  it("usa cache valido desde localStorage", async () => {
    const now = Date.UTC(2026, 0, 1, 0, 0, 0);
    vi.setSystemTime(now);
    localStorage.setItem(
      "pcoptimize_region",
      JSON.stringify({
        region: "international",
        countryCode: "US",
        timestamp: now,
      }),
    );

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() => useRegion());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.region).toBe("international");
    expect(result.current.countryCode).toBe("US");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("consulta /api/geo cuando no hay cache y persiste resultado", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        region: "international",
        countryCode: "CA",
      }),
    );

    const { result } = renderHook(() => useRegion());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.region).toBe("international");
    expect(result.current.countryCode).toBe("CA");

    const rawCache = localStorage.getItem("pcoptimize_region");
    expect(rawCache).toBeTruthy();
    expect(rawCache).toContain("international");
    expect(rawCache).toContain("CA");
  });

  it("elimina cache vencido antes de consultar", async () => {
    const base = Date.now() - 25 * 60 * 60 * 1000;
    localStorage.setItem(
      "pcoptimize_region",
      JSON.stringify({ region: "international", countryCode: "US", timestamp: base }),
    );

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        region: "latam",
        countryCode: "CO",
      }),
    );

    const { result } = renderHook(() => useRegion());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.region).toBe("latam");
    expect(result.current.countryCode).toBe("CO");
  });

  it("aplica fallback latam si falla la red", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useRegion());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.region).toBe("latam");
    expect(result.current.countryCode).toBe("");
  });

  it("no actualiza estado despues de desmontar", async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { unmount } = renderHook(() => useRegion());
    unmount();

    act(() => {
      resolveFetch?.(jsonResponse({ region: "international", countryCode: "US" }));
    });

    await Promise.resolve();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
