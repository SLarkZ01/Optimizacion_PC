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
- Tablas clave: `customers`, `purchases`, `bookings`
