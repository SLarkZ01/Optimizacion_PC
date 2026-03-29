# Integracion Brevo

- Ultima actualizacion: Marzo 2026
- Owner: Backend

## Emails transaccionales

- `sendPaymentConfirmationEmail()`: se envia al capturar el pago.
- `sendBookingConfirmationEmail()`: se envia al confirmar booking en Cal.com.

### Consistencia de precios

- El email de pago intenta resolver el precio dinamico desde `pricing_rules` segun `planId` y `region`.
- Si no puede consultar Supabase (entorno de test o fallo temporal), usa el monto capturado como fallback.
- Esto evita cortar el envio del email por dependencias externas y mantiene consistencia operativa.

## Helper de agendamiento

- `buildCalComUrl(email, name)` construye URL prellenada para reducir friccion de agenda.
