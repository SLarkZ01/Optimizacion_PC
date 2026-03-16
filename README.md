<div align="center">

# 🖥️ PCOptimize

### *Tu PC como nueva en 60 minutos*

**Servicio profesional de optimización remota de computadoras.**
Limpieza, velocidad y seguridad garantizada — 100% remoto, sin desinstalar nada.

[![Producción](https://img.shields.io/badge/🌐_Producción-pcoptimize.vercel.app-black?style=for-the-badge)](https://pcoptimize.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

</div>

---

## 📋 Tabla de contenidos

- [¿Qué es PCOptimize?](#-qué-es-pcoptimize)
- [Demo en producción](#-demo-en-producción)
- [Flujo de negocio](#-flujo-de-negocio)
- [Características](#-características)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura del proyecto](#-arquitectura-del-proyecto)
- [Base de datos](#-base-de-datos)
- [API Endpoints](#-api-endpoints)
- [Precios por región](#-precios-por-región)
- [Instalación local](#-instalación-local)
- [Variables de entorno](#-variables-de-entorno)
- [Comandos disponibles](#-comandos-disponibles)
- [Panel de administración](#-panel-de-administración)
- [Despliegue en Vercel](#-despliegue-en-vercel)
- [Convenciones del código](#-convenciones-del-código)
- [Contacto](#-contacto)

---

## 🚀 ¿Qué es PCOptimize?

**PCOptimize** es una aplicación web full-stack que combina:

- 🎯 **Landing page comercial** — para vender el servicio de optimización remota de PCs al público general
- 🔐 **Panel de administración** — dashboard privado para gestionar clientes, compras y reservas en tiempo real

### ¿Para quién es?

- **Clientes**: Usuarios que quieren que su PC funcione mejor sin llevarla a un técnico
- **Administrador**: Una sola persona gestiona todo el negocio desde el dashboard

### ¿Qué garantiza?

- ✅ 100% remoto — sin visitas, sin desinstalar programas
- ✅ Sesión de ~60-90 minutos con técnico en vivo vía RustDesk
- ✅ Garantía de devolución si no hay mejoras significativas

---

## 🌐 Demo en producción

> **[https://pcoptimize.vercel.app](https://pcoptimize.vercel.app)**

---

## 🔄 Flujo de negocio

```
🛒 Cliente visita la landing
        │
        ▼
💳 Elige plan (Básico o Gamer)
        │
        ▼
🌍 Precio mostrado según IP (LATAM vs Internacional)
        │
        ▼
🔒 Paga con PayPal (botones embebidos, REST API v2)
        │
        ▼
💾 POST /api/paypal/capture-order
   → Guarda cliente + compra en Supabase
   → Envía email de confirmación vía Brevo
        │
        ▼
📧 Cliente recibe email con link de Cal.com pre-llenado
        │
        ▼
📅 Cliente agenda su sesión de optimización
        │
        ▼
🔔 Cal.com dispara webhook → POST /api/webhooks/calcom
   → Guarda reserva en Supabase
   → Envía email con instrucciones de RustDesk
        │
        ▼
💻 Sesión de optimización remota (~90 min) vía RustDesk
        │
        ▼
✅ PC optimizada — Admin marca como completado en dashboard
```

---

## ✨ Características

### 🌐 Landing Page

| Sección | Descripción |
|---------|-------------|
| **Hero** | Fondo animado con partículas (adaptativo a dispositivo y `prefers-reduced-motion`), estadísticas en vivo |
| **Features** | 6 características del servicio: velocidad, seguridad, limpieza, 100% remoto, rápido, privacidad |
| **Sobre Mí** | Presentación del técnico/servicio |
| **Proceso** | 4 pasos visuales: Elige Plan → Agenda Cita → Nos Conectamos → PC Optimizada |
| **Precios** | Tarjetas con precios diferenciados por región IP + botones PayPal embebidos |
| **Testimonios** | 4 testimonios reales (Colombia, México, España, Argentina) |
| **FAQ** | 6 preguntas frecuentes en acordeón interactivo |
| **CTA** | Call to action final con enlace directo a precios |

> Las secciones 4-8 se cargan con `dynamic()` (lazy loading) para reducir el bundle inicial y mejorar el LCP.

### 🔐 Panel de Administración

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | KPIs (clientes, compras, reservas) + gráficas + tabla de compras recientes |
| `/dashboard/clientes` | Tabla paginada con buscador en tiempo real |
| `/dashboard/compras` | Tabla paginada con plan, monto y estado (badges) |
| `/dashboard/reservas` | Tabla paginada con fecha, estado y cliente vinculado |

**Seguridad en doble capa:**
1. `middleware.ts` — redirige a `/login` si no hay sesión activa
2. `dashboard/layout.tsx` — verificación server-side con `getUser()` como defensa en profundidad

---

## 🛠️ Stack tecnológico

| Categoría | Tecnología | Versión | Notas |
|-----------|-----------|---------|-------|
| **Framework** | [Next.js](https://nextjs.org) | 16.1.6 | App Router, Server Components por defecto |
| **UI Library** | [React](https://react.dev) | 19.2.3 | React 19 con nuevas características |
| **Lenguaje** | [TypeScript](https://typescriptlang.org) | ^5.9.3 | Strict mode, sin `any` |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com) | ^4.2.1 | v4 — configuración vía PostCSS/CSS, sin `tailwind.config.js` |
| **Componentes UI** | [shadcn/ui](https://ui.shadcn.com) | new-york | 15 componentes activos |
| **Base de datos** | [Supabase](https://supabase.com) | ^2.97.0 | PostgreSQL + `@supabase/ssr` para SSR |
| **Pagos** | [PayPal](https://developer.paypal.com) | ^8.9.2 | `@paypal/react-paypal-js` + REST API v2 |
| **Emails** | [Brevo](https://brevo.com) | ^4.0.1 | `@getbrevo/brevo` — emails transaccionales |
| **Agendamiento** | [Cal.com](https://cal.com) | — | Webhook + link pre-llenado con nombre y email |
| **Acceso remoto** | [RustDesk](https://rustdesk.com) | — | Instrucciones enviadas por email tras agendar |
| **Geolocalización** | [ipapi.co](https://ipapi.co) | — | Detección de región para precios diferenciados |
| **Gráficas** | [Recharts](https://recharts.org) | 2.15.4 | Con `dynamic(ssr:false)` para evitar SSR |
| **Formularios** | [React Hook Form](https://react-hook-form.com) | ^7.71.2 | + Zod para validación de esquemas |
| **Toasts** | [Sonner](https://sonner.emilkowal.ski) | ^1.7.4 | Provider global en root layout |
| **Animaciones** | [Framer Motion](https://www.framer.com/motion) | ^12.36.0 | Uso selectivo en componentes clave |
| **Package Manager** | [Bun](https://bun.sh) | latest | ⚠️ Usar `bun`, NO `npm` ni `yarn` |

---

## 🏗️ Arquitectura del proyecto

```
nextjs_optimizacion_pc/
│
├── 📁 app/                          # Next.js App Router
│   ├── layout.tsx                   # Root layout: PayPalProvider + Sonner
│   ├── page.tsx                     # Landing page (8 secciones con dynamic imports)
│   ├── globals.css                  # Estilos globales + Tailwind v4
│   ├── not-found.tsx                # Página 404 personalizada
│   │
│   ├── 📁 exito/                    # /exito — confirmación post-pago
│   ├── 📁 login/                    # /login — autenticación del administrador
│   │   ├── page.tsx                 #   Server Component con Suspense
│   │   ├── LoginForm.tsx            #   Client Component: formulario email/password
│   │   └── actions.ts               #   Server Actions: login() y logout()
│   │
│   ├── 📁 auth/callback/            # OAuth callback para Supabase SSR
│   │
│   ├── 📁 dashboard/                # Panel admin (protegido por middleware)
│   │   ├── layout.tsx               #   Sidebar + verificación auth defense-in-depth
│   │   ├── page.tsx                 #   KPIs + gráficas + compras recientes
│   │   ├── clientes/page.tsx        #   Tabla paginada de clientes
│   │   ├── compras/page.tsx         #   Tabla paginada de compras
│   │   └── reservas/page.tsx        #   Tabla paginada de reservas
│   │
│   └── 📁 api/
│       ├── paypal/
│       │   ├── create-order/        # POST — crea orden PayPal REST v2
│       │   └── capture-order/       # POST — captura pago, guarda en DB, envía email
│       └── webhooks/
│           ├── paypal/              # POST — webhook con verificación HMAC (seguridad)
│           └── calcom/              # POST — guarda reserva + envía email con RustDesk
│
├── 📁 components/
│   ├── layout/                      # Navbar, Footer
│   ├── sections/                    # 8 secciones de la landing page
│   ├── cards/                       # FeatureCard, PricingCard, ProcessCard, TestimonialCard
│   ├── shared/                      # BackButton, ScrollLink, PayPalProvider
│   ├── dashboard/                   # 9 componentes del panel admin
│   └── ui/                          # 15 componentes shadcn/ui
│
├── 📁 hooks/
│   ├── useCurrency.ts               # useRegion() — detecta latam/international vía IP
│   └── use-mobile.ts                # useMobile() — detecta viewport móvil
│
├── 📁 lib/
│   ├── utils.ts                     # cn() + scrollToSection()
│   ├── types.ts                     # Tipos TypeScript compartidos
│   ├── constants.ts                 # SITE_CONFIG, PRICING_PLANS, FEATURES, FAQ, etc.
│   ├── icons.ts                     # ICON_MAP centralizado (Lucide por nombre string)
│   ├── paypal.ts                    # PAYPAL_PRICES, getPrice(), getPayPalAccessToken()
│   ├── email.ts                     # sendPaymentConfirmationEmail() + sendBookingConfirmationEmail()
│   ├── supabase.ts                  # 3 clientes: browser, server, admin (service_role)
│   ├── dashboard.ts                 # Data fetching con React.cache() para streaming
│   └── database.types.ts            # Tipos TypeScript generados del schema de DB
│
├── 📁 supabase/
│   └── schema.sql                   # SQL completo: tablas, índices, RLS, RPCs paginadas
│
├── 📁 docs/                         # Documentación interna del proyecto
│   ├── project-overview.md
│   ├── structure.md
│   ├── architecture.md
│   ├── integrations.md
│   ├── dashboard.md
│   └── conventions.md
│
├── .env.example                     # Template de variables de entorno
├── next.config.ts                   # Image optimization (avif/webp) + optimizePackageImports
├── tsconfig.json                    # TypeScript strict, paths alias @/* → raíz
├── postcss.config.mjs               # Tailwind CSS v4
└── components.json                  # Config shadcn/ui (new-york, tailwind v4)
```

---

## 🗄️ Base de datos

El esquema está en [`supabase/schema.sql`](supabase/schema.sql). Incluye tablas, índices, RLS completo y RPCs paginadas.

### Tablas

**`customers`** — Clientes registrados tras el pago
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `UUID` PK | Identificador único |
| `email` | `TEXT` UNIQUE | Email del cliente |
| `name` | `TEXT` | Nombre completo |
| `country_code` | `TEXT` | Código ISO 3166-1 alpha-2 (ej: `CO`, `MX`) |
| `created_at` | `TIMESTAMPTZ` | Fecha de registro |

**`purchases`** — Compras realizadas vía PayPal
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `UUID` PK | Identificador único |
| `customer_id` | `UUID` FK | Referencia a `customers` |
| `paypal_order_id` | `TEXT` UNIQUE | ID de orden PayPal |
| `paypal_capture_id` | `TEXT` UNIQUE | ID de captura PayPal |
| `plan_type` | `ENUM` | `basic`, `gamer`, `premium` |
| `amount` | `NUMERIC(10,2)` | Monto pagado |
| `currency` | `TEXT` | Default `USD` |
| `status` | `ENUM` | `pending`, `completed`, `failed`, `refunded` |

**`bookings`** — Reservas de sesión vía Cal.com
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `UUID` PK | Identificador único |
| `purchase_id` | `UUID` FK | Referencia a `purchases` (nullable) |
| `cal_booking_id` | `TEXT` UNIQUE | ID del booking en Cal.com |
| `scheduled_date` | `TIMESTAMPTZ` | Fecha y hora agendada |
| `status` | `ENUM` | `scheduled`, `completed`, `cancelled`, `no_show` |
| `rustdesk_id` | `TEXT` | ID de RustDesk para la sesión |
| `notes` | `TEXT` | Notas adicionales |

### Seguridad RLS

- RLS habilitado con `FORCE ROW LEVEL SECURITY` en las 3 tablas
- `service_role` — acceso total (usado exclusivamente desde API routes del servidor)
- `authenticated` — solo `SELECT` (usado desde el dashboard admin)
- `anon` — sin acceso

### RPCs paginadas

Dos funciones PostgreSQL optimizadas para evitar el doble query:
- `search_purchases(search_term, page_number, page_size)` — con `COUNT(*) OVER()`
- `search_bookings(search_term, page_number, page_size)` — con `COUNT(*) OVER()`

---

## 🔌 API Endpoints

| Método | Ruta | Autenticación | Descripción |
|--------|------|--------------|-------------|
| `POST` | `/api/paypal/create-order` | Pública | Crea orden PayPal REST v2, devuelve `orderID` |
| `POST` | `/api/paypal/capture-order` | Pública | Captura pago, guarda en Supabase, envía email Brevo |
| `POST` | `/api/webhooks/paypal` | HMAC signature | Webhook de seguridad con verificación de firma |
| `POST` | `/api/webhooks/calcom` | — | Webhook Cal.com: guarda booking, envía email RustDesk |
| `GET` | `/auth/callback` | — | Intercambio de código OAuth para Supabase Auth |

---

## 💰 Precios por región

La región se detecta automáticamente vía [`ipapi.co`](https://ipapi.co) con cache en `localStorage` por 24h. Timeout de 4 segundos con fallback a `"international"`.

| Plan | 🌎 LATAM (USD) | 🌍 Internacional (USD) |
|------|----------------|------------------------|
| **Básico** | $19 | $30 |
| **Gamer** | $32 | $45 |

**Países LATAM incluidos:** CO, MX, AR, CL, PE, VE, EC, BO, PY, UY, GT, HN, SV, NI, CR, PA, DO, CU, PR

---

## 💻 Instalación local

### Requisitos previos

- [Bun](https://bun.sh) >= 1.0 (gestor de paquetes requerido)
- [Node.js](https://nodejs.org) >= 20
- Cuenta en [Supabase](https://supabase.com) con el schema aplicado
- Cuenta en [PayPal Developer](https://developer.paypal.com) (sandbox para desarrollo)
- Cuenta en [Brevo](https://brevo.com) para emails transaccionales
- Cuenta en [Cal.com](https://cal.com) con un tipo de evento configurado

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/nextjs_optimizacion_pc.git
cd nextjs_optimizacion_pc

# 2. Instalar dependencias
bun install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales (ver sección siguiente)

# 4. Aplicar el schema de la base de datos
# Copiar el contenido de supabase/schema.sql y ejecutarlo en el SQL Editor de Supabase

# 5. Iniciar servidor de desarrollo
bun dev
```

Abrir [http://localhost:3000](http://localhost:3000) para ver la landing page.

---

## 🔐 Variables de entorno

Copia `.env.example` a `.env.local` y completa todos los valores:

```bash
cp .env.example .env.local
```

### Supabase

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima (pública) | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (⚠️ privada, solo servidor) | Project Settings → API |

### PayPal

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Client ID de la app PayPal (pública) | PayPal Developer → Apps |
| `PAYPAL_CLIENT_SECRET` | Secret de la app PayPal (⚠️ privada) | PayPal Developer → Apps |
| `PAYPAL_WEBHOOK_ID` | ID del webhook registrado en PayPal | PayPal Developer → Webhooks |

> En desarrollo se usa **sandbox** automáticamente. En producción (`NODE_ENV=production`) usa la API real.

### Brevo (Emails)

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `BREVO_API_KEY` | API Key de Brevo | Brevo → Settings → API Keys |
| `BREVO_FROM_NAME` | Nombre del remitente (ej: `PCOptimize`) | — |
| `BREVO_FROM_EMAIL` | Email del remitente verificado en Brevo | Brevo → Senders |

### Cal.com

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_CAL_COM_URL` | URL de tu tipo de evento en Cal.com | Cal.com → Event Types |
| `CALCOM_WEBHOOK_SECRET` | Secret para verificar webhooks de Cal.com | Cal.com → Webhooks |

### Aplicación

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | URL pública de la aplicación | `https://pcoptimize.vercel.app` |

---

## 📦 Comandos disponibles

```bash
bun dev          # Servidor de desarrollo en http://localhost:3000
bun build        # Build de producción (con type-checking)
bun start        # Servidor de producción (requiere build previo)
bun lint         # Análisis estático con ESLint
```

> ⚠️ **Siempre usar `bun`**. No usar `npm`, `yarn` ni `pnpm` — este proyecto usa Bun como gestor de paquetes.

---

## 🔒 Panel de administración

### Acceso

1. Crear un usuario en Supabase Authentication con email + password
2. Navegar a `/login`
3. Ingresar las credenciales del administrador

### Rutas del dashboard

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Vista general: KPIs, gráficas de ingresos y distribución de planes, últimas compras |
| `/dashboard/clientes` | Lista completa de clientes con buscador y paginación |
| `/dashboard/compras` | Historial de compras con estado, plan y monto |
| `/dashboard/reservas` | Calendario de sesiones agendadas con estado |

### Características del dashboard

- 📊 **Gráfica de barras** — Ingresos mensuales (Recharts, con streaming paralelo)
- 🍩 **Gráfica donut** — Distribución de planes contratados
- 🔍 **Buscador con debounce** — 350ms, actualiza `?q=` en la URL (compatible con SSR)
- 📄 **Paginación por URL** — 10 registros por página, `?page=` como fuente de verdad
- 👁️ **Sheet de detalle** — Click en cliente muestra panel lateral con toda su información

---

## 🚀 Despliegue en Vercel

### Pasos

1. **Fork / push** del repositorio a GitHub

2. **Importar en Vercel** desde [vercel.com/new](https://vercel.com/new)
   - Framework preset: **Next.js** (detectado automáticamente)
   - Build command: `bun run build`
   - Install command: `bun install`

3. **Configurar variables de entorno** en Vercel Dashboard → Settings → Environment Variables
   - Agregar todas las variables listadas en la sección anterior
   - Asegurarse de que `NEXT_PUBLIC_APP_URL` apunta al dominio de producción

4. **Configurar webhooks en producción**:
   - **PayPal**: Registrar `https://tu-dominio.com/api/webhooks/paypal` en PayPal Developer Console
   - **Cal.com**: Registrar `https://tu-dominio.com/api/webhooks/calcom` en Cal.com → Webhooks

5. **Deploy** — Vercel desplegará automáticamente en cada push a `main`

### Requisitos adicionales en producción

- El dominio del email remitente debe estar verificado en Brevo
- Las credenciales de PayPal deben ser de **producción** (no sandbox)
- El esquema SQL debe estar aplicado en el proyecto Supabase de producción

---

## 📐 Convenciones del código

Este proyecto sigue convenciones estrictas. Ver [`docs/conventions.md`](docs/conventions.md) para la guía completa.

### Resumen de reglas clave

```
✅ Server Components por defecto — "use client" solo cuando es necesario
✅ TypeScript strict — sin any, sin @ts-ignore
✅ import type para tipos — import type { Foo } from './types'
✅ cn() para clases condicionales (clsx + tailwind-merge)
✅ Path alias @/* apunta a la raíz del proyecto
✅ React.cache() para deduplicación en data fetching del dashboard
✅ dynamic(ssr:false) para componentes pesados del cliente (Recharts)
```

### Orden de imports

```typescript
// 1. React / Next.js
import { type FC } from 'react'
import Link from 'next/link'

// 2. Librerías externas
import { Button } from '@/components/ui/button'

// 3. Componentes internos
import { MyComponent } from '@/components/MyComponent'

// 4. Utilidades y tipos
import { cn } from '@/lib/utils'
import type { MyType } from '@/lib/types'
```

### Estructura de componentes

```typescript
// types
interface MyComponentProps { ... }

// component
export function MyComponent({ prop }: MyComponentProps) {
  // hooks
  // derived state
  // handlers
  return (...)
}
```

---

## 📞 Contacto

| Canal | Información |
|-------|-------------|
| 📧 **Email** | [tmontoyamagon11@gmail.com](mailto:tmontoyamagon11@gmail.com) |
| 💬 **WhatsApp** | [+57 312 608 1990](https://wa.me/573126081990) |

---

<div align="center">

**Hecho con ❤️ para que tu PC vuele**

[🌐 pcoptimize.vercel.app](https://pcoptimize.vercel.app)

</div>
