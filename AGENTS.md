# AGENTS.md - Guía para Agentes de Código

> **Nota de mantenimiento**: Este archivo debe actualizarse cuando cambien las convenciones,
> se agreguen tests, o evolucione el stack tecnológico del proyecto.
> Última actualización: Marzo 2026

## Descripción del Proyecto

Landing page + **Panel de Administración** para **PCOptimize**, un servicio de optimización remota de computadoras.
Construido con Next.js 16.1.4, React 19 y TypeScript usando el App Router.

El flujo de negocio completo es:
1. El cliente elige un plan en la landing y paga con **PayPal** (precios en USD diferenciados por región)
2. Tras el pago, recibe un email con instrucciones para agendar su sesión vía **Cal.com**
3. Al agendar, recibe otro email con las instrucciones de conexión remota con **RustDesk**
4. La sesión de optimización se realiza de forma remota (~90 min)

---

## Comandos de Build/Lint/Test

```bash
# Desarrollo
bun dev                    # Servidor de desarrollo en http://localhost:3000

# Producción
bun run build              # Build de producción
bun run start              # Iniciar servidor de producción

# Linting
bun run lint               # Ejecutar ESLint (next/core-web-vitals + typescript)

# Tests (NO CONFIGURADOS ACTUALMENTE)
# TODO: Agregar Vitest o Jest cuando se implementen tests
```

### Notas sobre Tests
- Actualmente no hay infraestructura de tests configurada
- Cuando se agreguen, actualizar esta sección con comandos para:
  - Ejecutar todos los tests
  - Ejecutar un test individual
  - Ejecutar tests en modo watch

---

## Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── layout.tsx          # Layout raíz con 3 providers globales: PayPalProvider, TooltipProvider, Sonner
│   ├── page.tsx            # Página principal (landing)
│   ├── globals.css         # Estilos globales, variables CSS y clases utilitarias custom
│   ├── not-found.tsx       # Página 404 personalizada
│   ├── favicon.ico         # Favicon (en app/, no en public/)
│   ├── exito/              # Ruta /exito — página de confirmación post-pago con instrucciones
│   ├── login/              # Ruta /login — autenticación de administrador
│   │   ├── page.tsx        # Server Component wrapper con Suspense
│   │   ├── LoginForm.tsx   # Client Component con formulario de login
│   │   └── actions.ts      # Server actions: login(), logout()
│   ├── auth/
│   │   └── callback/       # GET /auth/callback — intercambio de código OAuth para Supabase Auth
│   ├── dashboard/          # Panel de administración (rutas protegidas por middleware)
│   │   ├── layout.tsx      # Layout con SidebarProvider + verificación de auth defense-in-depth
│   │   ├── page.tsx        # /dashboard — Resumen: KPIs, gráficas de ingresos y distribución de planes
│   │   ├── clientes/       # /dashboard/clientes — Tabla de clientes
│   │   ├── compras/        # /dashboard/compras — Tabla de compras con badges de estado
│   │   └── reservas/       # /dashboard/reservas — Tabla de reservas
│   └── api/
│       ├── paypal/
│       │   ├── create-order/   # POST /api/paypal/create-order — Crea orden PayPal REST v2
│       │   └── capture-order/  # POST /api/paypal/capture-order — Captura pago + envía email Brevo
│       └── webhooks/
│           ├── paypal/         # POST /api/webhooks/paypal — Webhook PayPal con verificación de firma
│           └── calcom/         # POST /api/webhooks/calcom — Webhook Cal.com: guarda booking + email RustDesk
├── components/
│   ├── layout/             # Navbar.tsx, Footer.tsx
│   ├── sections/           # Secciones de la landing (Hero, Features, Process, Pricing, etc.)
│   ├── cards/              # Cards de dominio (FeatureCard, PricingCard, ProcessCard, TestimonialCard)
│   ├── shared/             # BackButton.tsx, ScrollLink.tsx, PayPalProvider.tsx
│   ├── dashboard/          # Componentes del panel de administración
│   │   ├── DashboardSidebar.tsx          # Sidebar con navegación (Resumen, Clientes, Compras, Reservas) + logout
│   │   ├── DashboardHeader.tsx           # Header con breadcrumbs dinámicos
│   │   ├── IngresosChart.tsx             # Gráfica de barras de ingresos mensuales (recharts)
│   │   ├── PlanDistributionChart.tsx     # Gráfica donut de distribución de planes (recharts)
│   │   └── ComprasRecientesTable.tsx     # Tabla de compras recientes para el resumen
│   └── ui/                 # Componentes shadcn/ui (ver lista completa abajo)
├── hooks/
│   ├── useCurrency.ts      # useRegion() — detecta región latam/international por IP (ipapi.co)
│   └── use-mobile.ts       # useMobile() — detecta viewport móvil (shadcn)
├── lib/
│   ├── utils.ts            # cn() + scrollToSection()
│   ├── types.ts            # Tipos TypeScript: PlanId, PricingPlan, Feature, API request/response types
│   ├── constants.ts        # Constantes: SITE_CONFIG, PRICING_PLANS, FEATURES, TESTIMONIALS, FAQ, etc.
│   ├── icons.ts            # ICON_MAP centralizado (Lucide icons por nombre)
│   ├── whatsapp.ts         # getWhatsAppUrl() + WHATSAPP_URL constante
│   ├── paypal.ts           # PAYPAL_PRICES, PLAN_NAMES, getPrice(), getPayPalAccessToken(), getBaseUrl()
│   ├── email.ts            # sendPaymentConfirmationEmail() + sendBookingConfirmationEmail() via Brevo
│   ├── supabase.ts         # Clientes Supabase (browser, server, admin)
│   ├── dashboard.ts        # Funciones de data fetching para el dashboard (getDashboardStats, getCustomers, etc.)
│   └── database.types.ts   # Tipos TypeScript del esquema de DB (usar `type`, no `interface`)
├── middleware.ts            # Protege /dashboard/* (redirige a /login si no autenticado)
├── supabase/
│   └── schema.sql          # SQL para crear tablas (customers, purchases, bookings)
└── public/
    └── images/             # Directorio para imágenes estáticas (actualmente vacío)
```

### Path Alias
- `@/*` apunta a la raíz del proyecto (configurado en `tsconfig.json`)
- Ejemplo: `import { Button } from "@/components/ui/button"`

---

## Stack Tecnológico

| Tecnología       | Versión    | Notas                                          |
|------------------|------------|------------------------------------------------|
| Next.js          | 16.1.4     | App Router, Server Components por defecto      |
| React            | 19.2.3     | React 19 con nuevas características            |
| TypeScript       | ^5.9.3     | Strict mode habilitado                         |
| Tailwind CSS     | ^4.2.1     | v4 con PostCSS (sin tailwind.config.js)        |
| tw-animate-css   | ^1.4.0     | Animaciones CSS importadas en globals.css      |
| shadcn/ui        | new-york   | 20 componentes UI (ver lista completa en sección Componentes) |
| Supabase         | ^2.97.0    | @supabase/supabase-js + @supabase/ssr          |
| PayPal           | ^8.9.2     | @paypal/react-paypal-js (client) + REST API v2 (server) |
| Brevo            | ^4.0.1     | @getbrevo/brevo — emails transaccionales       |
| Bun              | -          | Gestor de paquetes (usar `bun` no `npm`)        |

### Librerías Principales
- **UI**: Radix UI primitives, Lucide React (iconos)
- **Forms**: React Hook Form + Zod (validación)
- **Notificaciones**: Sonner (toasts)
- **Pagos**: PayPal REST API v2 + `@paypal/react-paypal-js`
- **Emails**: Brevo (`@getbrevo/brevo`) con templates HTML propios
- **Agendamiento**: Cal.com (integración via webhook)
- **Acceso remoto**: RustDesk (mencionado en emails e instrucciones al cliente)
- **Geolocalización**: ipapi.co (detección de región para precios diferenciados)
- **Base de Datos**: Supabase (PostgreSQL) con clientes browser/server/admin
- **Utilidades**: clsx, tailwind-merge, class-variance-authority

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

> **Nota**: `.env.example` actualmente documenta `RESEND_API_KEY` en lugar de las variables de Brevo —
> esto es incorrecto. El proyecto usa Brevo (`BREVO_API_KEY`, etc.) desde `lib/email.ts`.
> Actualizar `.env.example` si se sincroniza con el equipo.

---

## Integraciones Externas

### PayPal REST API v2
- **Flujo**: El frontend usa `@paypal/react-paypal-js` para renderizar el botón PayPal.
- `POST /api/paypal/create-order` — crea la orden en PayPal y devuelve `orderID`.
- `POST /api/paypal/capture-order` — captura el pago, guarda en Supabase (`customers` + `purchases`), y envía email de confirmación via Brevo.
- `POST /api/webhooks/paypal` — webhook de seguridad para capturar pagos que el frontend no completó. Verifica firma HMAC.
- Entorno: sandbox en desarrollo, producción en `NODE_ENV === "production"`.
- Credenciales: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` (OAuth 2.0 client credentials).

### Precios por Región (`lib/paypal.ts`)
- Siempre en **USD**, sin conversión de monedas.
- La región se detecta en el cliente via `useRegion()` (`hooks/useCurrency.ts`) usando `ipapi.co/json/`.
- Cache en `localStorage` por 24h con clave `pcoptimize_region`.
- Timeout de 4 segundos; fallback a `"international"` si falla.

| Plan    | Latam (USD) | Internacional (USD) |
|---------|-------------|----------------------|
| basic   | $19         | $30                  |
| gamer   | $32         | $45                  |

**Países Latam**: CO, MX, AR, CL, PE, VE, EC, BO, PY, UY, GT, HN, SV, NI, CR, PA, DO, CU, PR

### Brevo (Emails Transaccionales — `lib/email.ts`)
Dos funciones de envío, cada una con su template HTML inline:

1. **`sendPaymentConfirmationEmail()`** — se llama desde `/api/paypal/capture-order` tras capturar el pago.
   - Muestra: plan contratado, monto, ID de orden, CTA para agendar en Cal.com.
2. **`sendBookingConfirmationEmail()`** — se llama desde `/api/webhooks/calcom` al confirmar un booking.
   - Muestra: fecha agendada, instrucciones paso a paso de RustDesk, CTA de WhatsApp.

Ambas funciones capturan errores internamente y retornan `false` si fallan (no bloquean el flujo principal).

### Cal.com (`app/api/webhooks/calcom/route.ts`)
- Recibe el evento `BOOKING_CREATED` de Cal.com.
- Verifica el secret via header `x-cal-signature-256` o `x-webhook-secret` (si `CALCOM_WEBHOOK_SECRET` está definida).
- Busca el cliente en Supabase por email y relaciona el booking con su `purchase_id`.
- Guarda el booking en la tabla `bookings` (idempotente — duplicados ignorados con código `23505`).
- Envía email de confirmación con instrucciones de RustDesk.
- Eventos distintos a `BOOKING_CREATED` se ignoran con HTTP 200 (evita reintentos).

---

## Providers Globales (layout.tsx)

El layout raíz envuelve la app con tres providers en este orden:

```tsx
<PayPalProvider>          // Inicializa @paypal/react-paypal-js con clientId y currency: "USD"
  <TooltipProvider>       // Radix UI — necesario para tooltips en cualquier parte del árbol
    {children}
    <Suspense fallback={null}>
      <Sonner />          // Toasts globales
    </Suspense>
  </TooltipProvider>
</PayPalProvider>
```

**Font**: Inter (`next/font/google`) con variable CSS `--font-inter`, aplicada en `<body>` como `font-sans`.

---

## Convenciones de Código

### Imports (orden recomendado)
```typescript
// 1. Directivas ("use client", "use server")
"use client";

// 2. Imports de React/Next
import * as React from "react";
import type { Metadata } from "next";

// 3. Imports de librerías externas
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

// 4. Imports internos con alias @/
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRICING_PLANS } from "@/lib/constants";
import type { PricingPlan } from "@/lib/types";
```

### Nomenclatura
- **Componentes**: PascalCase (`HeroSection.tsx`, `PricingCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useCurrency.ts`)
- **Utilidades/Constantes**: camelCase (`utils.ts`, `constants.ts`)
- **Tipos/Interfaces**: PascalCase (`PricingPlan`, `Feature`)
- **Variables CSS**: kebab-case (`--primary-foreground`)

### Estructura de Componentes
```typescript
// Componente de sección (con interactividad)
"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  // Funciones auxiliares primero
  const handleClick = () => { /* ... */ };

  return (
    <section className="...">
      {/* JSX */}
    </section>
  );
};

export default HeroSection;
```

### TypeScript
- **Strict mode habilitado**: No usar `any`, definir tipos explícitos
- **Interfaces para props**: Definir siempre `interface ComponentProps {}`
- **Tipos en lib/types.ts**: Centralizar tipos compartidos
- **`as const`**: Usar para arrays/objetos inmutables en constants.ts
- **`type` para DB**: Usar `type` (no `interface`) en `database.types.ts`

```typescript
// Correcto
interface PricingCardProps {
  plan: PricingPlan;
  region: PricingRegion;
}

// Evitar
const PricingCard = ({ plan, region }: any) => { /* ... */ }
```

### Manejo de Estilos

#### Usar siempre `cn()` para clases condicionales
```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-class",
  variant === "primary" ? "primary-styles" : "secondary-styles"
)} />
```

#### Clases utilitarias custom (definidas en globals.css)
- `gradient-primary` — Gradiente azul (#3B82F6) → morado (#8B5CF6)
- `gradient-accent` — Gradiente verde (#10B981) → azul (#3B82F6)
- `gradient-text` — Texto con gradiente azul/morado (usa `-webkit-background-clip`)
- `glow-primary` — Box shadow azul difuso
- `glow-accent` — Box shadow verde difuso
- `glass` — Glassmorphism con fondo semitransparente
- `glass-card` — Glassmorphism con borde y fondo de card
- `content-auto` — `content-visibility: auto` con `contain-intrinsic-size: auto 200px` (listas largas)
- `content-auto-sm` — `content-visibility: auto` con `contain-intrinsic-size: auto 80px` (items de acordeón)
- `animate-fade-in` — Fade in de 0.3s

#### Variables de color (tema oscuro por defecto)
- `--primary`: Azul (#3B82F6)
- `--secondary`: Morado (#8B5CF6)
- `--accent`: Verde (#10B981)
- Usar: `text-primary`, `bg-primary/10`, `border-primary`

---

## Patrones y Arquitectura

### Server vs Client Components
- **Por defecto**: Server Components (sin directiva)
- **Usar `"use client"`** solo cuando sea necesario:
  - Hooks de React (useState, useEffect, etc.)
  - Event handlers (onClick, onChange, etc.)
  - APIs del navegador (window, document, localStorage)
  - Componentes de PayPal (`PayPalProvider`, `PayPalButtons`)

### Componentes shadcn/ui
- Ubicación: `components/ui/`
- **6 componentes activos**: accordion, badge, button, card, sonner, tooltip
- **14 componentes del dashboard**: breadcrumb, chart, dialog, dropdown-menu, avatar, input, label, select, separator, sheet, sidebar, skeleton, table, tabs
- **Generados por shadcn CLI** — Evitar modificaciones extensivas
- **SÍ modificar** cuando haya errores de lint/TypeScript (ej: interfaces vacías, funciones impuras)
- Para personalizar estilos, crear wrapper o usar `cn()` con clases adicionales

### Constantes Centralizadas
- Toda la data estática debe ir en `lib/constants.ts`
- Incluye: `SITE_CONFIG`, `PRICING_PLANS`, `FEATURES`, `TESTIMONIALS`, etc.
- Usar `as const` para type safety

### Tipos Centralizados (`lib/types.ts`)
- `PlanId` — `"basic" | "gamer"`
- `PricingPlan`, `Feature`, `ProcessStep`, `Testimonial`, `FAQItem`
- `NavLink`, `SocialLinks`, `ContactInfo`
- `CreateOrderRequest/Response`, `CaptureOrderRequest/Response` — API PayPal
- `ApiError` — respuesta de error genérica
- Importar con: `import type { PricingPlan } from "@/lib/types"`

### Utilidades Centralizadas
- **`lib/utils.ts`**: `cn()` para clases condicionales + `scrollToSection()` para navegación suave
- **`lib/icons.ts`**: `ICON_MAP` centralizado de Lucide icons (evitar mapas duplicados en componentes)
- **`lib/whatsapp.ts`**: `getWhatsAppUrl(message?)` + `WHATSAPP_URL` pre-calculada
- **`lib/paypal.ts`**: `PAYPAL_PRICES`, `PLAN_NAMES`, `getPrice()`, `getPayPalAccessToken()`, `getPayPalApiBase()`, `getBaseUrl()`
- **`lib/email.ts`**: `sendPaymentConfirmationEmail()`, `sendBookingConfirmationEmail()`
- **`hooks/useCurrency.ts`**: `useRegion()` — devuelve `{ region, countryCode, loading }`
- **`lib/dashboard.ts`**: `getDashboardStats()`, `getCustomers()`, `getPurchases()`, `getBookings()` — data fetching con `createAdminClient()`

---

## Panel de Administración (Dashboard)

### Autenticación
- **Usuario único**: Solo un administrador puede acceder al dashboard.
- **Flujo**: Email + contraseña via Supabase Auth (`signInWithPassword`).
- **Login**: `/login` — Server Component wrapper (`page.tsx`) + Client Component (`LoginForm.tsx`) con `<Suspense>`.
- **Logout**: Server action en `app/login/actions.ts`, invocado desde el sidebar del dashboard.
- **Callback**: `/auth/callback` — intercambia código OAuth por sesión (necesario para SSR con Supabase).

### Seguridad (doble capa)
1. **Middleware** (`middleware.ts`): Intercepta todas las rutas `/dashboard/*`. Si no hay sesión válida, redirige a `/login?redirectTo=...`. También redirige `/login` → `/dashboard` si ya está autenticado.
2. **Defense-in-depth** (`app/dashboard/layout.tsx`): El layout del dashboard verifica la sesión con `supabase.auth.getUser()` (server-side, no solo cookies). Si falla, redirige a `/login`.

### Rutas del Dashboard
| Ruta | Descripción | Data Fetching |
|------|-------------|---------------|
| `/dashboard` | Resumen: 4 KPIs + gráfica de ingresos + distribución de planes + compras recientes | `getDashboardStats()` |
| `/dashboard/clientes` | Tabla de clientes con email, nombre, fecha de registro | `getCustomers()` |
| `/dashboard/compras` | Tabla de compras con plan, monto, estado (badge), fecha | `getPurchases()` |
| `/dashboard/reservas` | Tabla de reservas con fecha programada, estado, cliente | `getBookings()` |

### Componentes del Dashboard (`components/dashboard/`)
- **`DashboardSidebar.tsx`**: Sidebar colapsable con navegación a 4 secciones + botón de logout. Usa `SidebarProvider` de shadcn.
- **`DashboardHeader.tsx`**: Header con `SidebarTrigger` + breadcrumbs dinámicos basados en la ruta actual.
- **`IngresosChart.tsx`**: Gráfica de barras (recharts) con ingresos mensuales de los últimos 6 meses. Usa `ChartContainer` de shadcn.
- **`PlanDistributionChart.tsx`**: Gráfica de donut/pie (recharts) con distribución de ventas por plan. Usa `ChartContainer` de shadcn.
- **`ComprasRecientesTable.tsx`**: Tabla con las 5 compras más recientes, incluyendo cliente, plan, monto y estado.

### Data Fetching (`lib/dashboard.ts`)
Todas las funciones usan `createAdminClient()` (service_role key, bypassa RLS):
- **`getDashboardStats()`**: Retorna KPIs (total clientes, compras, reservas, ingresos), datos para gráficas de ingresos mensuales y distribución de planes.
- **`getCustomers()`**: Lista todos los clientes ordenados por fecha de creación.
- **`getPurchases()`**: Lista todas las compras con datos del cliente (JOIN), ordenadas por fecha.
- **`getBookings()`**: Lista todas las reservas con datos del cliente y la compra (JOINs).

---

## Recursos Adicionales

### Best Practices de Rendimiento
Ver documentación completa en: `.agents/skills/vercel-react-best-practices/`
- 57 reglas de optimización organizadas por categoría
- Ejemplos de código correcto vs incorrecto
- Métricas de impacto por regla

### Diseño de Interfaz
Ver documentación en: `.agents/skills/interface-design/`
- Guía de diseño para dashboards, apps y productos interactivos

### Prioridades de Optimización
1. Evitar re-renders innecesarios
2. Usar Server Components cuando sea posible
3. Lazy loading para componentes pesados
4. Optimizar imágenes con `next/image`
5. Usar `content-auto` / `content-auto-sm` para listas largas fuera del viewport

---

## Checklist para Nuevos Componentes

- [ ] Definir si necesita `"use client"` o puede ser Server Component
- [ ] Crear interface para props con TypeScript
- [ ] Usar `cn()` para clases condicionales
- [ ] Importar desde `@/components/ui/` para componentes base
- [ ] Agregar tipos a `lib/types.ts` si son reutilizables
- [ ] Seguir estructura de carpetas existente

## Checklist para Nuevas Rutas API

- [ ] Usar `NextResponse.json()` para respuestas
- [ ] Tipar el body del request con una interface
- [ ] Verificar variables de entorno al inicio y retornar 500 si faltan
- [ ] Envolver en try/catch y loguear errores con contexto
- [ ] Para webhooks: verificar firma/secret antes de procesar
- [ ] Para operaciones con Supabase: usar `createAdminClient()` (service role)
