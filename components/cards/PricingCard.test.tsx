import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PricingPlan } from "@/lib/types";
import PricingCard from "@/components/cards/PricingCard";
import { jsonResponse } from "@/tests/utils/http";

const mocked = vi.hoisted(() => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: mocked.toast,
}));

vi.mock("@paypal/react-paypal-js", () => ({
  PayPalButtons: ({ createOrder, onApprove, onError, onCancel }: {
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onError: (error: Error) => void;
    onCancel: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => void createOrder().catch(() => undefined)}>
        paypal-create-order
      </button>
      <button type="button" onClick={() => void onApprove({ orderID: "ORDER-1" })}>
        paypal-approve
      </button>
      <button type="button" onClick={() => onError(new Error("paypal-error"))}>
        paypal-error
      </button>
      <button type="button" onClick={onCancel}>
        paypal-cancel
      </button>
    </div>
  ),
}));

const plan: PricingPlan = {
  id: "basic",
  name: "Basico",
  duration: "90 minutos",
  description: "Plan base",
  features: ["Limpieza", "Optimizacion"],
  popular: false,
  cta: "Comprar",
};

describe("components/cards/PricingCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocked.toast.error.mockReset();
    mocked.toast.info.mockReset();
  });

  it("muestra badge de precio especial para LATAM", () => {
    render(<PricingCard plan={plan} priceUSD={19} region="latam" />);
    expect(screen.getByText("Precio especial Latinoamérica")).toBeInTheDocument();
  });

  it("createOrder llama endpoint y maneja error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({ error: "fallo" }, { status: 500 }),
    );

    render(<PricingCard plan={plan} priceUSD={19} region="latam" />);
    fireEvent.click(screen.getByRole("button", { name: "paypal-create-order" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/paypal/create-order",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("onApprove exitoso no dispara error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ success: true }),
    );

    render(<PricingCard plan={plan} priceUSD={19} region="international" />);
    fireEvent.click(screen.getByRole("button", { name: "paypal-approve" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/paypal/capture-order",
        expect.objectContaining({ method: "POST" }),
      );
    });
    expect(mocked.toast.error).not.toHaveBeenCalledWith("Error al procesar el pago", expect.anything());
  });

  it("onApprove con error del backend muestra toast", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "capture failed" }, { status: 500 }),
    );

    render(<PricingCard plan={plan} priceUSD={19} region="international" />);
    fireEvent.click(screen.getByRole("button", { name: "paypal-approve" }));

    await waitFor(() => {
      expect(mocked.toast.error).toHaveBeenCalledWith("Error al procesar el pago", {
        description: "capture failed",
      });
    });
  });

  it("onError y onCancel muestran toasts", () => {
    render(<PricingCard plan={plan} priceUSD={19} region="international" />);

    fireEvent.click(screen.getByRole("button", { name: "paypal-error" }));
    fireEvent.click(screen.getByRole("button", { name: "paypal-cancel" }));

    expect(mocked.toast.error).toHaveBeenCalledWith("Error con PayPal", {
      description: "Hubo un problema al iniciar el pago. Intenta de nuevo.",
    });
    expect(mocked.toast.info).toHaveBeenCalledWith("Pago cancelado", {
      description: "Puedes intentar de nuevo cuando quieras.",
    });
  });
});
