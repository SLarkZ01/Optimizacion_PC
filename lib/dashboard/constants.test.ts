import { BOOKING_STATUS_CONFIG } from "@/lib/dashboard/constants";

describe("lib/dashboard/constants", () => {
  it("define todos los estados de booking", () => {
    expect(BOOKING_STATUS_CONFIG.scheduled.label).toBe("Agendada");
    expect(BOOKING_STATUS_CONFIG.completed.variant).toBe("secondary");
    expect(BOOKING_STATUS_CONFIG.cancelled.variant).toBe("destructive");
    expect(BOOKING_STATUS_CONFIG.no_show.label).toBe("No asistio");
  });
});
