# Integracion Cal.com

- Ultima actualizacion: Marzo 2026
- Owner: Backend

## Webhook

- Endpoint: `/api/webhooks/calcom`
- Evento relevante: `BOOKING_CREATED`
- Verificacion: HMAC SHA-256 con `x-cal-signature-256`

## Flujo

1. Se verifica firma.
2. Se busca cliente por email.
3. Se inserta booking (idempotente).
4. Se envia email de instrucciones RustDesk.

Eventos no relevantes retornan 200 para evitar reintentos innecesarios.
