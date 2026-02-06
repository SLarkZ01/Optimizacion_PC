import { SITE_CONFIG } from "@/lib/constants";

/**
 * Genera una URL de WhatsApp con mensaje pre-cargado.
 * Centraliza la lógica que antes se repetía en Footer, CTASection y exito/page.
 */
export function getWhatsAppUrl(message?: string): string {
  const phone = SITE_CONFIG.contact.whatsapp.replace(/\D/g, "");
  const text = encodeURIComponent(message ?? SITE_CONFIG.contact.whatsappMessage);
  return `https://wa.me/${phone}?text=${text}`;
}

/** URL de WhatsApp con el mensaje por defecto del sitio (pre-calculada) */
export const WHATSAPP_URL = getWhatsAppUrl();
