# Dashboard Auth y Seguridad

- Ultima actualizacion: Marzo 2026
- Owner: Backend

## Autenticacion

- Login por email/password con Supabase Auth.
- Logout via server action.

## Defensa en doble capa

1. `proxy.ts` protege `/dashboard/*` y redirige cuando no hay sesion valida.
2. `app/dashboard/layout.tsx` vuelve a validar sesion server-side (defense-in-depth).
