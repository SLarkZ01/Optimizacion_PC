# Project Overview

## Descripción

Landing page + **Panel de Administración** para **PCOptimize**, un servicio de optimización remota de computadoras.
Construido con Next.js 16.1.6, React 19 y TypeScript usando el App Router.

## Flujo de Negocio

1. El cliente elige un plan en la landing y paga con **PayPal** (precios en USD diferenciados por región)
2. Tras el pago, recibe un email con instrucciones para agendar su sesión vía **Cal.com**
3. Al agendar, recibe otro email con las instrucciones de conexión remota con **RustDesk**
4. La sesión de optimización se realiza de forma remota (~90 min)

---

## Stack Tecnológico

| Tecnología       | Versión    | Notas                                          |
|------------------|------------|------------------------------------------------|
| Next.js          | 16.1.6     | App Router, Server Components por defecto      |
| React            | 19.2.3     | React 19 con nuevas características            |
| TypeScript       | ^5.9.3     | Strict mode habilitado                         |
| Tailwind CSS     | ^4.2.1     | v4 con PostCSS (sin tailwind.config.js)        |
| tw-animate-css   | ^1.4.0     | Animaciones CSS importadas en globals.css      |
| shadcn/ui        | new-york   | 15 componentes UI activos                      |
| Supabase         | ^2.97.0    | @supabase/supabase-js + @supabase/ssr          |
| PayPal           | ^8.9.2     | @paypal/react-paypal-js (client) + REST API v2 (server) |
| Brevo            | ^4.0.1     | @getbrevo/brevo — emails transaccionales       |
| Bun              | -          | Gestor de paquetes estándar del proyecto |

### Librerías Principales

- **UI**: Radix UI primitives, Lucide React (iconos)
- **Forms**: React Hook Form + Zod (validación)
- **Notificaciones**: Sonner (toasts)
- **Pagos**: PayPal REST API v2 + `@paypal/react-paypal-js`
- **Emails**: Brevo (`@getbrevo/brevo`) con templates HTML propios
- **Agendamiento**: Cal.com (integración via webhook)
- **Acceso remoto**: RustDesk (mencionado en emails e instrucciones al cliente)
- **Geolocalización**: Vercel Request Headers (`x-vercel-ip-country`) para detección de región
- **Base de Datos**: Supabase (PostgreSQL) con clientes browser/server/admin
- **Utilidades**: clsx, tailwind-merge, class-variance-authority

---

## Comandos

```bash
# Desarrollo
bun run dev                # Servidor de desarrollo en http://localhost:3000

# Producción
bun run build              # Build de producción
bun run start              # Iniciar servidor de producción

# Linting
bun run lint               # Ejecutar ESLint (next/core-web-vitals + typescript)

# Type checking
bun run typecheck          # Verificación de tipos TypeScript

# Tests (NO CONFIGURADOS ACTUALMENTE)
# TODO: Agregar Vitest o Jest cuando se implementen tests
```

> **Tests**: Actualmente no hay infraestructura de tests configurada. Cuando se agreguen, actualizar esta sección con comandos para ejecutar todos los tests, un test individual y tests en modo watch.

---

## Variables de Entorno

Copiar `.env.example` a `.env.local` y completar con valores reales. Nunca subir `.env.local` a Git.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=Axxxxxxxx...B       # Público — usado en cliente y servidor
PAYPAL_CLIENT_SECRET=Exxxxxxxx...F               # Privado — solo servidor
PAYPAL_WEBHOOK_ID=xxxxxxxxx                      # ID del webhook registrado en PayPal Dashboard

# Brevo (emails transaccionales)
BREVO_API_KEY=xkeysib-...
BREVO_FROM_NAME=PCOptimize                       # Nombre del remitente
BREVO_FROM_EMAIL=hola@pcoptimize.com             # Debe ser dominio verificado en Brevo

# Cal.com
NEXT_PUBLIC_CAL_COM_URL=https://cal.com/tu-usuario   # Link de agendamiento embebido en emails
CALCOM_WEBHOOK_SECRET=...                             # Secret para verificar webhooks de Cal.com

# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.com       # URL base para redirecciones de PayPal
```

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/geo` | Devuelve `region` y `countryCode` desde `x-vercel-ip-country` |
| `POST` | `/api/paypal/create-order` | Crea orden PayPal con precio resuelto en servidor |
| `POST` | `/api/paypal/capture-order` | Captura pago, persiste compra/cliente y envía email |
| `POST` | `/api/webhooks/paypal` | Webhook de respaldo para confirmar pagos |
| `POST` | `/api/webhooks/calcom` | Registra booking y dispara email con instrucciones |
