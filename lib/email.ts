// Helper para envío de emails con Resend
// Se usa directamente desde la API de capture-order, no desde N8N
// Esto garantiza que el cliente reciba su confirmación incluso si N8N falla

import { Resend } from "resend";
import type { PlanId } from "@/lib/types";
import { PLAN_NAMES } from "@/lib/paypal";

// Inicialización diferida: el cliente se crea en tiempo de ejecución,
// no en tiempo de build, para evitar error si RESEND_API_KEY no está disponible
let _resend: Resend | null = null;
function getResendClient(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Dominio remitente — usar el dominio verificado en Resend
// En desarrollo/sin dominio propio se puede usar onboarding@resend.dev (solo envía al dueño de la cuenta)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "PCOptimize <onboarding@resend.dev>";

// Link de Cal.com para agendar sesiones
const CAL_COM_URL = process.env.NEXT_PUBLIC_CAL_COM_URL || "https://cal.com/pcoptimize";

// ============================================================
// Tipos
// ============================================================

export interface ConfirmationEmailData {
  toEmail: string;
  customerName: string | null;
  planId: PlanId;
  amount: number;
  orderId: string;
}

// ============================================================
// Template HTML del email de confirmación
// ============================================================

function buildConfirmationEmailHtml(data: ConfirmationEmailData): string {
  const { customerName, planId, amount, orderId } = data;
  const planName = PLAN_NAMES[planId] ?? "PCOptimize";
  const greeting = customerName ? `Hola ${customerName.split(" ")[0]}` : "Hola";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pago recibido - PCOptimize</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f,#2d1b69);border-radius:12px 12px 0 0;padding:32px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                &#x2705; ¡Pago recibido!
              </p>
              <p style="margin:0;font-size:16px;color:#94a3b8;">
                Tu optimización está en camino
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#1e293b;padding:32px;">

              <p style="margin:0 0 24px 0;font-size:18px;color:#e2e8f0;">
                ${greeting} 👋
              </p>

              <p style="margin:0 0 24px 0;font-size:15px;color:#94a3b8;line-height:1.6;">
                Confirmamos que recibimos tu pago correctamente. A continuación los detalles:
              </p>

              <!-- Detalles del pago -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;font-size:14px;color:#64748b;">Plan contratado</td>
                        <td style="padding:8px 0;font-size:14px;color:#e2e8f0;text-align:right;font-weight:600;">${planName}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #1e293b;font-size:14px;color:#64748b;">Monto pagado</td>
                        <td style="padding:8px 0;border-top:1px solid #1e293b;font-size:18px;color:#3b82f6;text-align:right;font-weight:700;">$${amount} USD</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-top:1px solid #1e293b;font-size:14px;color:#64748b;">ID de orden</td>
                        <td style="padding:8px 0;border-top:1px solid #1e293b;font-size:12px;color:#475569;text-align:right;font-family:monospace;">${orderId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Siguiente paso -->
              <p style="margin:0 0 16px 0;font-size:17px;font-weight:600;color:#e2e8f0;">
                &#x1F4C5; Siguiente paso: agenda tu sesión
              </p>

              <p style="margin:0 0 24px 0;font-size:15px;color:#94a3b8;line-height:1.6;">
                Elige el día y hora que más te convenga. La sesión se realiza de forma remota
                y dura aproximadamente <strong style="color:#e2e8f0;">60-90 minutos</strong>.
              </p>

              <!-- CTA Agendar -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:8px;padding:1px;">
                    <a href="${CAL_COM_URL}" target="_blank"
                       style="display:block;padding:14px 32px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:7px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;text-align:center;">
                      &#x1F4C5; Agendar mi sesión ahora
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Instrucciones -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#e2e8f0;">&#x1F4CB; Qué esperar en tu sesión:</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">&#x2705; Conexión remota segura con RustDesk (te enviamos el link)</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">&#x2705; Limpieza de archivos temporales y malware</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">&#x2705; Optimización de inicio y rendimiento general</p>
                    <p style="margin:0;font-size:13px;color:#94a3b8;">&#x2705; Soporte post-sesión por WhatsApp</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                ¿Tienes alguna pregunta? Responde a este email o escríbenos por WhatsApp.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border-top:1px solid #1e293b;">
              <p style="margin:0;font-size:12px;color:#334155;">
                PCOptimize · Optimización remota de computadoras
              </p>
              <p style="margin:4px 0 0 0;font-size:11px;color:#1e3a5f;">
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
 * Envía el email de confirmación de pago al cliente.
 * Se llama desde /api/paypal/capture-order después de capturar el pago.
 * No lanza excepciones — loguea el error y retorna false si falla,
 * para no bloquear la respuesta al cliente (el pago ya fue cobrado).
 */
export async function sendPaymentConfirmationEmail(
  data: ConfirmationEmailData
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada — omitiendo envío de email de confirmación");
    return false;
  }

  const planName = PLAN_NAMES[data.planId] ?? "PCOptimize";
  const firstName = data.customerName ? data.customerName.split(" ")[0] : null;
  const subject = firstName
    ? `${firstName}, tu pago fue recibido — Agenda tu sesión`
    : "Tu pago fue recibido — Agenda tu sesión";

  try {
    const { data: result, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: [data.toEmail],
      subject,
      html: buildConfirmationEmailHtml(data),
      tags: [
        { name: "plan", value: data.planId },
        { name: "type", value: "payment_confirmation" },
      ],
    });

    if (error) {
      console.error("Resend: Error enviando email de confirmación:", error);
      return false;
    }

    console.log(
      `Resend: Email de confirmación enviado a ${data.toEmail} (Plan: ${planName}, Orden: ${data.orderId}, ID: ${result?.id})`
    );
    return true;
  } catch (err) {
    console.error("Resend: Excepción enviando email de confirmación:", err);
    return false;
  }
}
