# AGENTS.md - Guía para Agentes de Código

> Última actualización: Marzo 2026

Landing page + Panel de Administración para **PCOptimize**, un servicio de optimización remota de computadoras.

---

## Documentación detallada

| Archivo | Contenido |
|---------|-----------|
| [`docs/project-overview.md`](docs/project-overview.md) | Descripción del negocio, flujo completo, stack tecnológico, comandos, variables de entorno |
| [`docs/structure.md`](docs/structure.md) | Árbol de directorios, shadcn/ui components, path alias, utilidades y tipos |
| [`docs/architecture.md`](docs/architecture.md) | Providers globales, Server vs Client components, data fetching, rutas API, prioridades de rendimiento |
| [`docs/integrations.md`](docs/integrations.md) | PayPal REST v2, precios por región, Brevo emails, Cal.com webhook, RustDesk, Supabase clients |
| [`docs/dashboard.md`](docs/dashboard.md) | Auth, seguridad en doble capa, rutas, 8 componentes del panel, data fetching y tipos exportados |
| [`docs/conventions.md`](docs/conventions.md) | Orden de imports, nomenclatura, estructura de componentes, TypeScript, estilos, checklists |

---

## Flujo de negocio

1. Cliente elige plan → paga con **PayPal** (precios USD diferenciados por región)
2. Tras el pago → email con link de **Cal.com** para agendar sesión
3. Al agendar → email con instrucciones de conexión remota vía **RustDesk**
4. Sesión de optimización remota (~90 min)

---
