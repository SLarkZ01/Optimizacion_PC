import type {
  ApiError,
  CaptureOrderRequest,
  CaptureOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  PlanId,
} from "@/lib/types";

describe("lib/types compile contracts", () => {
  it("conserva contratos de API esperados", () => {
    const plan: PlanId = "basic";
    const createReq: CreateOrderRequest = { planId: plan };
    const createRes: CreateOrderResponse = { orderID: "ORDER-1" };
    const captureReq: CaptureOrderRequest = { orderID: "ORDER-1" };
    const captureRes: CaptureOrderResponse = {
      success: true,
      orderID: "ORDER-1",
      redirectUrl: "/exito?order_id=ORDER-1",
    };
    const error: ApiError = { error: "boom" };

    expect(createReq.planId).toBe("basic");
    expect(createRes.orderID).toBe("ORDER-1");
    expect(captureReq.orderID).toBe("ORDER-1");
    expect(captureRes.success).toBe(true);
    expect(error.error).toBe("boom");
  });
});
