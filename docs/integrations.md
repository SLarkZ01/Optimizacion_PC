# Integraciones Externas

## PayPal REST API v2

### Flujo de pago

1. El frontend renderiza el botón con `@paypal/react-paypal-js` (`PayPalButtons`)
2. Al hacer clic, llama a `POST /api/paypal/create-order` → devuelve `orderID`
3. PayPal procesa el pago del usuario
4. Al aprobar, llama a `POST /api/paypal/capture-order` → captura el dinero, guarda en Supabase y envía email
5. `POST /api/webhooks/paypal` actúa como respaldo para pagos que el frontend no completó

### Configuración

- **Entorno**: sandbox en desarrollo, producción cuando `NODE_ENV === "production"`
- **Autenticación**: OAuth 2.0 Client Credentials (`NEXT_PUBLIC_PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET`)
- **Webhook**: verificación de firma HMAC con `PAYPAL_WEBHOOK_ID`

### Helpers (`lib/paypal.ts`)

- `getPayPalAccessToken()` — obtiene token OAuth v2
- `getPayPalApiBase()` — URL base según entorno (sandbox / producción)
- `getBaseUrl()` — URL del sitio para redirecciones PayPal
- `getPrice(planId, region)` — precio en USD para plan + región
- `PAYPAL_PRICES` — mapa de precios por plan y región
- `PLAN_NAMES` — nombres de producto para la descripción de la orden

---

## Precios por Región

Los precios son siempre en **USD**, sin conversión de monedas. La región se detecta en servidor con el header `x-vercel-ip-country` y se usa como fuente autoritativa en `POST /api/paypal/create-order`.

- Detección principal: `x-vercel-ip-country` (ISO 3166-1 alpha-2)
- Fallback: `"latam"` si el header no está disponible (ej: local/dev)
- La UI consulta `GET /api/geo` (cache CDN por país + `Vary: X-Vercel-IP-Country`) y guarda caché cliente en `localStorage` por 24h (`pcoptimize_region`)

| Plan    | Latam (USD) | Internacional (USD) |
|---------|-------------|----------------------|
| basic   | $19         | $30                  |
| gamer   | $32         | $45                  |

**Países Latam**: CO, MX, AR, CL, PE, VE, EC, BO, PY, UY, GT, HN, SV, NI, CR, PA, DO, CU, PR

---

## Brevo — Emails Transaccionales (`lib/email.ts`)

Dos funciones de envío, cada una con su template HTML inline. Ambas capturan errores internamente y retornan `false` si fallan — no bloquean el flujo principal.

### `sendPaymentConfirmationEmail()`

- **Cuándo**: Se llama desde `POST /api/paypal/capture-order` tras capturar el pago
- **Contenido**: Plan contratado, monto, ID de orden, CTA para agendar en Cal.com
- El link de Cal.com se construye con `buildCalComUrl(email, name)` — pre-llena email y nombre del cliente en el formulario de agendamiento

### `sendBookingConfirmationEmail()`

- **Cuándo**: Se llama desde `POST /api/webhooks/calcom` al confirmar un booking
- **Contenido**: Fecha agendada, instrucciones paso a paso de RustDesk, CTA de WhatsApp

### `buildCalComUrl(email, name)`

Función auxiliar exportada que construye el link de Cal.com con query params `?email=...&name=...` pre-llenados. Se usa en el email de confirmación de pago y en la página `/exito` (Server Component) para que el cliente no tenga que escribir su email al agendar.

```typescript
buildCalComUrl("cliente@email.com", "Juan Pérez")
// → "https://cal.com/usuario?email=cliente%40email.com&name=Juan+P%C3%A9rez"
```

---

## Cal.com — Agendamiento (`app/api/webhooks/calcom/route.ts`)

El cliente agenda su sesión desde el link de Cal.com recibido en el email de confirmación de pago. El link está pre-llenado con su email y nombre (via `buildCalComUrl`) para garantizar que agende con el mismo email con el que realizó su compra en PayPal.

### Flujo del webhook

1. Cal.com envía `BOOKING_CREATED` al webhook
2. Se verifica el secret via HMAC-SHA256 con `crypto.subtle` (header `x-cal-signature-256`)
3. Se busca el cliente en Supabase por email y se relaciona el booking con su `purchase_id` (nullable — un booking puede no tener compra asociada)
4. Se guarda el booking en la tabla `bookings` (idempotente — duplicados ignorados con código `23505`)
5. Se envía email de confirmación con instrucciones de RustDesk

> Eventos distintos a `BOOKING_CREATED` se ignoran con HTTP 200 para evitar reintentos de Cal.com.

---

## RustDesk — Acceso Remoto

No tiene integración técnica directa. Las instrucciones de conexión (ID del técnico, contraseña temporal) se envían al cliente en el `sendBookingConfirmationEmail()`. La sesión de optimización dura aproximadamente 90 minutos.

---

## Supabase (`lib/supabase.ts`)

Tres clientes según el contexto de uso:

| Función | Contexto | Clave usada |
|---------|----------|-------------|
| `createBrowserClient()` | Client Components | `ANON_KEY` |
| `createServerClient()` | Server Components / Route Handlers | `ANON_KEY` + cookies |
| `createAdminClient()` | Operaciones privilegiadas (webhooks, dashboard) | `SERVICE_ROLE_KEY` (bypassea RLS) |

El esquema de la base de datos está en `supabase/schema.sql` con las tablas `customers`, `purchases` y `bookings`.

### RLS (Row Level Security)

- RLS habilitado en las 3 tablas con `FORCE ROW LEVEL SECURITY` (impide bypass por el propietario)
- `service_role`: 1 política `FOR ALL` por tabla (en lugar de 4 separadas por operación)
- `authenticated`: política `SELECT` de solo lectura para el dashboard admin
- Escritura solo desde API routes del servidor via `createAdminClient()`

### Índices activos

| Índice | Tabla | Columna | Notas |
|--------|-------|---------|-------|
| `customers_email_key` | customers | email | Implícito por UNIQUE constraint |
| `idx_customers_name` | customers | name | Para búsquedas ILIKE por nombre |
| `purchases_paypal_order_id_key` | purchases | paypal_order_id | Implícito por UNIQUE constraint |
| `purchases_paypal_capture_id_key` | purchases | paypal_capture_id | Implícito por UNIQUE constraint |
| `idx_purchases_created_at` | purchases | created_at DESC | ORDER BY en `search_purchases` |
| `bookings_cal_booking_id_key` | bookings | cal_booking_id | Implícito por UNIQUE constraint |
| `idx_bookings_purchase_id` | bookings | purchase_id | JOIN en `search_bookings` |
| `idx_bookings_created_at` | bookings | created_at DESC | ORDER BY en `search_bookings` |

### País del cliente (`country_code`)

La columna `customers.country_code` (ISO 3166-1 alpha-2, ej: `"CO"`, `"US"`) se captura con dos fuentes:

1. **Fuente primaria**: `country_code` resuelto en servidor desde `x-vercel-ip-country` al crear la orden (`POST /api/paypal/create-order`) — se incluye en `custom_id`.
2. **Fallback**: `payer.address.country_code` de la respuesta de captura de PayPal — disponible cuando el perfil del pagador está completo.

El valor se almacena en `customers.country_code` al crear un cliente nuevo en `POST /api/paypal/capture-order`.

### Mismatch de país (seguridad)

Si `country_code` de metadata (Vercel) difiere de `payer.address.country_code` (PayPal), se aplica política **flag and allow**:

- Se permite el flujo de pago (no se bloquea conversión)
- Se registra un warning con contexto para auditoría antifraude (posible VPN/proxy o geolocalización inconsistente)
