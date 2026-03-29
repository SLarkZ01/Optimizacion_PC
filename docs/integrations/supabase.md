# Integracion Supabase

- Ultima actualizacion: Marzo 2026
- Owner: Backend

## Clientes por contexto

- `createBrowserClient()`: cliente anonimo en Client Components
- `createServerClient()`: server con cookies
- `createAdminClient()`: service role para operaciones privilegiadas

## Seguridad

- RLS habilitado en tablas principales
- Escrituras desde servidor con `createAdminClient()`

## Esquema

- Referencia SQL: `supabase/schema.sql`
- Tablas clave: `customers`, `purchases`, `bookings`, `pricing_rules`

## Cambios recientes de dominio

- `purchases` ahora incluye:
  - `gross_amount_usd`
  - `paypal_fee_usd`
  - `net_amount_usd`
- `pricing_rules` define precios editables por `plan_type` + `region` para checkout/landing/emails.
