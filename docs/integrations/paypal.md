# Integracion PayPal

- Ultima actualizacion: Marzo 2026
- Owner: Backend

## Flujo

1. Frontend crea orden en `/api/paypal/create-order`.
2. Usuario aprueba pago.
3. Frontend captura en `/api/paypal/capture-order`.
4. Se persiste compra/cliente y se envia email.
5. Webhook `/api/webhooks/paypal` actua como respaldo.

## Configuracion

- OAuth Client Credentials
- Sandbox en desarrollo y produccion en entorno productivo
- Verificacion de webhook con `PAYPAL_WEBHOOK_ID`

## Precios por region

- USD por plan y region (`latam` e `international`).
- Region resuelta en servidor desde `x-vercel-ip-country`.
