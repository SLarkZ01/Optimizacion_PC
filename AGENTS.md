# AGENTS.md - Guía para Agentes de Código

> Última actualización: Marzo 2026

Landing page + Panel de Administración para **PCOptimize**, un servicio de optimización remota de computadoras.

---

## Documentación detallada

| Archivo | Contenido |
|---------|-----------|
| [`docs/README.md`](docs/README.md) | Índice principal de documentación modular |
| [`docs/product/overview.md`](docs/product/overview.md) | Contexto del producto y stack principal |
| [`docs/product/business-flow.md`](docs/product/business-flow.md) | Flujo de negocio end-to-end |
| [`docs/setup/commands.md`](docs/setup/commands.md) | Comandos de desarrollo, calidad y testing |
| [`docs/setup/environment-variables.md`](docs/setup/environment-variables.md) | Variables de entorno y seguridad |
| [`docs/architecture/app-architecture.md`](docs/architecture/app-architecture.md) | Providers, Server/Client, fetching y rendimiento |
| [`docs/integrations/paypal.md`](docs/integrations/paypal.md) | Integración de pagos y precios por región |
| [`docs/integrations/supabase.md`](docs/integrations/supabase.md) | Clientes, RLS y esquema |
| [`docs/dashboard/overview.md`](docs/dashboard/overview.md) | Panorama general del panel admin |
| [`docs/conventions/typescript.md`](docs/conventions/typescript.md) | Reglas de TypeScript y tipado |
| [`docs/testing/vitest-setup.md`](docs/testing/vitest-setup.md) | Infra de testing con Vitest |

---

## Flujo de negocio

1. Cliente elige plan → paga con **PayPal** (precios USD diferenciados por región)
2. Tras el pago → email con link de **Cal.com** para agendar sesión
3. Al agendar → email con instrucciones de conexión remota vía **RustDesk**
4. Sesión de optimización remota (~90 min)

---
