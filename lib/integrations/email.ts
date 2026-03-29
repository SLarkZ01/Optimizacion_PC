// Helper para envío de emails con Brevo (antes Sendinblue)
// Se usa directamente desde la API de capture-order, no desde N8N
// Esto garantiza que el cliente reciba su confirmación incluso si N8N falla

import { BrevoClient } from "@getbrevo/brevo";
import type { PlanId } from "@/lib/domain/types";
import { PLAN_NAMES } from "@/lib/integrations/paypal";
import { getCheckoutPriceUSD } from "@/lib/server/pricing/queries";
import type { PricingRegion } from "@/lib/domain/database.types";

// Link base de Cal.com para agendar sesiones
const CAL_COM_BASE_URL = process.env.NEXT_PUBLIC_CAL_COM_URL || "https://cal.com/pcoptimize";

// Paleta alineada con app/globals.css (tema principal)
const EMAIL_COLORS = {
  background: "#0a0a0b",
  surface: "#18181b",
  panel: "#111113",
  text: "#fafafa",
  mutedText: "#a1a1aa",
  subtleText: "#71717a",
  border: "#27272a",
  primary: "#22c55e",
  secondary: "#60a5fa",
  accent: "#fb923c",
  whatsapp: "#25d366",
} as const;

/**
 * Construye el link de Cal.com con email y nombre pre-llenados.
 * Cal.com acepta ?email=...&name=... para pre-rellenar el formulario de booking.
 * Si no se proporcionan datos, retorna la URL base genérica.
 */
export function buildCalComUrl(email?: string | null, name?: string | null): string {
  if (!email) return CAL_COM_BASE_URL;
  const params = new URLSearchParams({ email });
  if (name) params.set("name", name);
  return `${CAL_COM_BASE_URL}?${params.toString()}`;
}

// ============================================================
// Inicialización diferida del cliente Brevo
// Se crea en tiempo de ejecución para evitar errores en build time
// ============================================================

let _brevo: BrevoClient | null = null;

function getBrevoClient(): BrevoClient {
  if (!_brevo) {
    _brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY ?? "" });
  }
  return _brevo;
}

// ============================================================
// Tipos
// ============================================================

export interface ConfirmationEmailData {
  toEmail: string;
  customerName: string | null;
  customerEmail?: string;   // Para construir el link de Cal.com pre-llenado
  planId: PlanId;
  amount: number;
  region?: PricingRegion;
  orderId: string;
}

export interface BookingConfirmationEmailData {
  toEmail: string;
  customerName: string | null;
  scheduledDate: string | null;  // ISO 8601
  calBookingId: string | null;
}

// ============================================================
// Template HTML del email de confirmación
// ============================================================

function buildConfirmationEmailHtml(data: ConfirmationEmailData): string {
  const { customerName, customerEmail, planId, amount, orderId } = data;
  const planName = PLAN_NAMES[planId] ?? "PCOptimize";
  const calUrl = buildCalComUrl(customerEmail ?? data.toEmail, customerName);
  const greeting = customerName ? `Hola ${customerName.split(" ")[0]}` : "Hola";
  const c = EMAIL_COLORS;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pago recibido - PCOptimize</title>
</head>
<body style="margin:0;padding:0;background-color:${c.background};font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${c.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${c.primary},${c.secondary});border-radius:12px 12px 0 0;padding:32px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:${c.text};letter-spacing:-0.5px;">
                &#x2705; ¡Pago recibido!
              </p>
              <p style="margin:0;font-size:16px;color:${c.text};">
                Tu optimización está en camino
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:${c.surface};padding:32px;">

              <p style="margin:0 0 24px 0;font-size:18px;color:${c.text};">
                ${greeting} &#x1F44B;
              </p>

              <p style="margin:0 0 24px 0;font-size:15px;color:${c.mutedText};line-height:1.6;">
                Confirmamos que recibimos tu pago correctamente. A continuación los detalles:
              </p>

              <!-- Detalles del pago -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${c.panel};border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;font-size:14px;color:${c.subtleText};">Plan contratado</td>
                        <td style="padding:8px 0;font-size:14px;color:${c.text};text-align:right;font-weight:600;">${planName}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid ${c.border};font-size:14px;color:${c.subtleText};">Monto pagado</td>
                        <td style="padding:8px 0;border-top:1px solid ${c.border};font-size:18px;color:${c.primary};text-align:right;font-weight:700;">$${amount} USD</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid ${c.border};font-size:14px;color:${c.subtleText};">ID de orden</td>
                        <td style="padding:8px 0;border-top:1px solid ${c.border};font-size:12px;color:${c.mutedText};text-align:right;font-family:monospace;">${orderId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Siguiente paso -->
              <p style="margin:0 0 16px 0;font-size:17px;font-weight:600;color:${c.text};">
                &#x1F4C5; Siguiente paso: agenda tu sesión
              </p>

              <p style="margin:0 0 24px 0;font-size:15px;color:${c.mutedText};line-height:1.6;">
                Elige el día y hora que más te convenga. La sesión se realiza de forma remota
                y dura aproximadamente <strong style="color:${c.text};">60-90 minutos</strong>.
              </p>

              <!-- CTA Agendar -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
                <tr>
                  <td style="background:${c.secondary};border-radius:8px;">
                    <a href="${calUrl}" target="_blank"
                       style="display:block;padding:14px 32px;background:${c.secondary};border-radius:8px;font-size:16px;font-weight:600;color:${c.background};text-decoration:none;text-align:center;">
                      &#x1F4C5; Agendar mi sesión ahora
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Instrucciones -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${c.panel};border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:${c.text};">&#x1F4CB; Qué esperar en tu sesión:</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:${c.mutedText};">&#x2705; Conexión remota segura con RustDesk (te enviamos el link)</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:${c.mutedText};">&#x2705; Limpieza de archivos temporales y malware</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:${c.mutedText};">&#x2705; Optimización de inicio y rendimiento general</p>
                    <p style="margin:0;font-size:13px;color:${c.mutedText};">&#x2705; Soporte post-sesión por WhatsApp</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:${c.subtleText};line-height:1.6;">
                ¿Tienes alguna pregunta? Responde a este email o escríbenos por WhatsApp.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${c.background};border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border-top:1px solid ${c.border};">
              <p style="margin:0;font-size:12px;color:${c.subtleText};">
                PCOptimize · Optimización remota de computadoras
              </p>
              <p style="margin:4px 0 0 0;font-size:11px;color:${c.mutedText};">
                Este email fue generado automáticamente. ID de orden: ${orderId}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================================
// Función principal de envío
// ============================================================

/**
 * Envía el email de confirmación de pago al cliente via Brevo.
 * Se llama desde /api/paypal/capture-order después de capturar el pago.
 * No lanza excepciones — loguea el error y retorna false si falla,
 * para no bloquear la respuesta al cliente (el pago ya fue cobrado).
 */
export async function sendPaymentConfirmationEmail(
  data: ConfirmationEmailData
): Promise<boolean> {
  if (!process.env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY no configurada — omitiendo envío de email de confirmación");
    return false;
  }

  const planName = PLAN_NAMES[data.planId] ?? "PCOptimize";
  const firstName = data.customerName ? data.customerName.split(" ")[0] : null;
  const subject = firstName
    ? `${firstName}, tu pago fue recibido — Agenda tu sesión`
    : "Tu pago fue recibido — Agenda tu sesión";

  const fromName = process.env.BREVO_FROM_NAME || "PCOptimize";
  const fromEmail = process.env.BREVO_FROM_EMAIL || "no-reply@pcoptimize.com";

  try {
    const expectedAmount = await getCheckoutPriceUSD(
      data.planId,
      data.region === "international" ? "international" : "latam",
    );

    const response = await getBrevoClient().transactionalEmails.sendTransacEmail({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: data.toEmail, name: data.customerName || undefined }],
      subject,
      htmlContent: buildConfirmationEmailHtml({
        ...data,
        amount: expectedAmount,
      }),
    });

    console.log(
      `Brevo: Email de confirmación enviado a ${data.toEmail} (Plan: ${planName}, Orden: ${data.orderId}, MessageID: ${response.messageId})`
    );
    return true;
  } catch (err) {
    console.error("Brevo: Error enviando email de confirmación:", err);
    return false;
  }
}

// ============================================================
// Template HTML del email de confirmación de agendamiento
// ============================================================

function buildBookingConfirmationEmailHtml(data: BookingConfirmationEmailData): string {
  const { customerName, scheduledDate, calBookingId } = data;
  const greeting = customerName ? `Hola ${customerName.split(" ")[0]}` : "Hola";
  const c = EMAIL_COLORS;

  // Formatear fecha legible (ej: "Martes 25 de Febrero a las 3:00 PM")
  let fechaLegible = "la fecha y hora que agendaste";
  if (scheduledDate) {
    try {
      const date = new Date(scheduledDate);
      fechaLegible = date.toLocaleString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Bogota",
        hour12: true,
      });
    } catch {
      fechaLegible = scheduledDate;
    }
  }

  const refLine = calBookingId
    ? `<p style="margin:4px 0 0 0;font-size:11px;color:${c.mutedText};">Referencia de sesión: ${calBookingId}</p>`
    : "";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sesión confirmada - PCOptimize</title>
</head>
<body style="margin:0;padding:0;background-color:${c.background};font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${c.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${c.secondary},${c.accent});border-radius:12px 12px 0 0;padding:32px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:${c.background};letter-spacing:-0.5px;">
                &#x1F4C5; ¡Sesión agendada!
              </p>
              <p style="margin:0;font-size:16px;color:${c.background};">
                Tu sesión de optimización está confirmada
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:${c.surface};padding:32px;">

              <p style="margin:0 0 24px 0;font-size:18px;color:${c.text};">
                ${greeting} &#x1F44B;
              </p>

              <p style="margin:0 0 24px 0;font-size:15px;color:${c.mutedText};line-height:1.6;">
                Tu sesión de optimización remota ha sido <strong style="color:${c.primary};">confirmada</strong>
                para <strong style="color:${c.text};">${fechaLegible}</strong>.
              </p>

              <!-- Instrucciones RustDesk -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${c.panel};border-radius:8px;margin-bottom:32px;border-left:3px solid ${c.secondary};">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:${c.text};">
                      &#x1F4BB; Cómo conectarte (RustDesk)
                    </p>
                    <p style="margin:0 0 12px 0;font-size:14px;color:${c.mutedText};line-height:1.6;">
                      <strong style="color:${c.text};">Paso 1:</strong> Descarga RustDesk gratis desde
                      <a href="https://rustdesk.com" style="color:${c.secondary};">rustdesk.com</a>
                      e instálalo en tu computadora.
                    </p>
                    <p style="margin:0 0 12px 0;font-size:14px;color:${c.mutedText};line-height:1.6;">
                      <strong style="color:${c.text};">Paso 2:</strong> Abre RustDesk y copia tu
                      <strong style="color:${c.text};">ID y contraseña temporal</strong>.
                    </p>
                    <p style="margin:0;font-size:14px;color:${c.mutedText};line-height:1.6;">
                      <strong style="color:${c.text};">Paso 3:</strong> Envíanos tu ID por WhatsApp
                      <strong style="color:${c.text};">15 minutos antes</strong> de la sesión y nos
                      conectaremos puntualmente.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA WhatsApp -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
                <tr>
                  <td style="background:${c.whatsapp};border-radius:8px;">
                    <a href="https://wa.me/573126081990" target="_blank"
                       style="display:block;padding:14px 32px;background:${c.whatsapp};border-radius:8px;font-size:16px;font-weight:600;color:${c.background};text-decoration:none;text-align:center;">
                      &#x1F4F1; Enviar ID de RustDesk por WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Qué incluye la sesión -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${c.panel};border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:${c.text};">&#x1F527; Lo que haremos en tu sesión (~90 min):</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:${c.mutedText};">&#x2705; Limpieza de archivos temporales y caché</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:${c.mutedText};">&#x2705; Eliminación de malware y programas no deseados</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:${c.mutedText};">&#x2705; Optimización del inicio de Windows</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:${c.mutedText};">&#x2705; Ajuste de rendimiento general del sistema</p>
                    <p style="margin:0;font-size:13px;color:${c.mutedText};">&#x2705; Soporte post-sesión por WhatsApp (7 días)</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:${c.subtleText};line-height:1.6;">
                ¿Necesitas reprogramar? Puedes hacerlo desde el link que te envió Cal.com.
                ¿Tienes alguna duda? Escríbenos por WhatsApp.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${c.background};border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border-top:1px solid ${c.border};">
              <p style="margin:0;font-size:12px;color:${c.subtleText};">
                PCOptimize · Optimización remota de computadoras
              </p>
              ${refLine}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================================
// Envío del email de confirmación de agendamiento
// ============================================================

/**
 * Envía el email con instrucciones de RustDesk al cliente tras agendar en Cal.com.
 * Se llama desde /api/webhooks/calcom después de confirmar el booking.
 * No lanza excepciones — loguea el error y retorna false si falla.
 */
export async function sendBookingConfirmationEmail(
  data: BookingConfirmationEmailData
): Promise<boolean> {
  if (!process.env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY no configurada — omitiendo email de confirmación de agendamiento");
    return false;
  }

  const firstName = data.customerName ? data.customerName.split(" ")[0] : null;
  const subject = firstName
    ? `${firstName}, tu sesión está confirmada — Instrucciones para conectarte`
    : "Tu sesión está confirmada — Instrucciones para conectarte";

  const fromName = process.env.BREVO_FROM_NAME || "PCOptimize";
  const fromEmail = process.env.BREVO_FROM_EMAIL || "no-reply@pcoptimize.com";

  try {
    const response = await getBrevoClient().transactionalEmails.sendTransacEmail({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: data.toEmail, name: data.customerName || undefined }],
      subject,
      htmlContent: buildBookingConfirmationEmailHtml(data),
    });

    console.log(
      `Brevo: Email de agendamiento enviado a ${data.toEmail} ` +
      `(BookingID: ${data.calBookingId}, MessageID: ${response.messageId})`
    );
    return true;
  } catch (err) {
    console.error("Brevo: Error enviando email de agendamiento:", err);
    return false;
  }
}
