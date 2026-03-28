# Testing con Vitest

- Ultima actualizacion: Marzo 2026
- Owner: Frontend

Base de testing configurada con:

- `vitest.config.ts`: `jsdom`, `globals`, `setupFiles`, alias `@`, coverage V8
- `vitest.setup.ts`: `@testing-library/jest-dom/vitest`, mocks globales base (`matchMedia`, `scrollIntoView`)
- `tsconfig.json`: tipos `vitest/globals` y `vitest/jsdom`
- `tests/utils/`: helpers reutilizables para `jsonResponse` y mock de Supabase

## Comandos

```bash
bun run test
bun run test:run
bun run test:coverage
```

- `test`: watch mode para desarrollo.
- `test:run`: una sola pasada (falla si hay tests rotos).
- `test:coverage`: reporte `text`, `html` y `json-summary` en `coverage/`.

## Convencion

- Ubicar tests junto al modulo probado usando `.test.ts` o `.test.tsx`.
- Para tests de rutas API/proxy, usar `// @vitest-environment node` al inicio del archivo.
- Para hooks/componentes, mantener `jsdom` por defecto.
- Evitar dependencias de red/SDK reales; mockear PayPal, Brevo, Supabase y `fetch`.
- Mantener tests deterministas (sin hora local implícita ni random sin controlar).

## Cobertura inicial implementada

- Core de pagos: `app/api/paypal/create-order/route.test.ts`, `app/api/paypal/capture-order/route.test.ts`
- Webhooks: `app/api/webhooks/paypal/route.test.ts`, `app/api/webhooks/calcom/route.test.ts`
- Geo/pricing: `lib/geo.test.ts`, `lib/paypal.test.ts`, `app/api/geo/route.test.ts`, `hooks/useCurrency.test.tsx`
- Auth y seguridad: `app/login/actions.test.ts`, `app/auth/callback/route.test.ts`, `proxy.test.ts`, `app/dashboard/layout.test.tsx`
- Dashboard data/actions: `lib/dashboard.test.ts`, `lib/actions.test.ts`
- UI critica: `components/cards/PricingCard.test.tsx`, `components/dashboard/common/SearchInput.test.tsx`, `components/dashboard/common/Pagination.test.tsx`
- Integraciones auxiliares: `lib/email.test.ts`, `hooks/use-mobile.test.tsx`

## Cobertura actual y objetivo

- Meta de calidad actual configurada en CI: `80/80/80` para statements/lines/functions y `65` para branches.
- Cobertura global actual supera el objetivo y se valida en `bun run test:coverage`.

## Soporte

- Para interpretar logs, modo watch y diferencias entre error real vs salida informativa, ver: `docs/testing/troubleshooting.md`.
