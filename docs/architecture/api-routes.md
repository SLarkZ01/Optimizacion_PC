# Rutas API

- Ultima actualizacion: Marzo 2026
- Owner: Backend

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/geo` | Region y pais por header de Vercel |
| GET | `/api/pricing` | Retorna matriz de precios activa (fallback seguro si falla DB) |
| POST | `/api/paypal/create-order` | Crea orden en PayPal |
| POST | `/api/paypal/capture-order` | Captura pago, guarda datos y envia email |
| POST | `/api/webhooks/paypal` | Webhook de respaldo de pagos |
| POST | `/api/webhooks/calcom` | Guarda booking y envia instrucciones |

## Patron recomendado

- Validar env vars al inicio
- Tipar body del request
- Manejar errores con `try/catch`
- Responder con `NextResponse.json()`
- Verificar firma en webhooks
