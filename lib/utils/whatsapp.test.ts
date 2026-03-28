import { WHATSAPP_URL, getWhatsAppUrl } from "@/lib/utils/whatsapp";

describe("lib/whatsapp", () => {
  it("genera URL con mensaje por defecto y telefono limpio", () => {
    expect(WHATSAPP_URL).toBe(
      "https://wa.me/573126081990?text=Hola!%20Me%20interesa%20optimizar%20mi%20PC",
    );
  });

  it("genera URL con mensaje personalizado encodeado", () => {
    expect(getWhatsAppUrl("Hola equipo, quiero agendar mañana"))
      .toBe("https://wa.me/573126081990?text=Hola%20equipo%2C%20quiero%20agendar%20ma%C3%B1ana");
  });
});
