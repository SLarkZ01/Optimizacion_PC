import { Circle } from "lucide-react";
import { DEFAULT_ICON, ICON_MAP } from "@/lib/icons";

describe("lib/icons", () => {
  it("incluye iconos usados por constantes", () => {
    expect(ICON_MAP.Zap).toBeDefined();
    expect(ICON_MAP.Calendar).toBeDefined();
    expect(ICON_MAP.CheckCircle).toBeDefined();
  });

  it("define icono fallback", () => {
    expect(DEFAULT_ICON).toBe(Circle);
  });
});
