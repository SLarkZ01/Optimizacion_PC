# Product Overview

- Ultima actualizacion: Marzo 2026
- Owner: Product + Engineering

Landing page + panel de administracion para PCOptimize, un servicio de optimizacion remota de computadoras.

## Stack principal

| Tecnologia | Version | Notas |
|---|---|---|
| Next.js | 16.1.6 | App Router, Server Components por defecto |
| React | 19.2.3 | React 19 |
| TypeScript | ^5.9.3 | Strict mode habilitado |
| Tailwind CSS | ^4.2.1 | v4 con PostCSS |
| Supabase | ^2.97.0 | Auth + DB |
| PayPal | ^8.9.2 | Checkout en landing + REST API v2 server |
| Brevo | ^4.0.1 | Emails transaccionales |
| Vitest | ^4.1.1 | Base de testing unitario/integracion ligera |

## Librerias clave

- UI: Radix UI, Lucide, shadcn/ui
- Formularios: React Hook Form + Zod
- Notificaciones: Sonner
- Testing: Vitest + jsdom + Testing Library

## Documentos relacionados

- Flujo de negocio: `docs/product/business-flow.md`
- Comandos: `docs/setup/commands.md`
- Variables de entorno: `docs/setup/environment-variables.md`
- Integraciones: `docs/integrations/paypal.md`
