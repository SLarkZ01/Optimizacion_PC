# Estructura del Proyecto

## Árbol de Directorios

```
├── app/                    # App Router de Next.js
│   ├── layout.tsx          # Layout raíz con TooltipProvider, Sonner y Vercel Analytics
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
│   ├── dashboard/          # Panel de administración (rutas protegidas por proxy)
│   │   ├── layout.tsx      # Layout con SidebarProvider + verificación de auth defense-in-depth
│   │   ├── page.tsx        # /dashboard — Resumen: KPIs, gráficas de ingresos y distribución de planes
│   │   ├── clientes/       # /dashboard/clientes — Tabla de clientes
│   │   ├── compras/        # /dashboard/compras — Tabla de compras con badges de estado
│   │   └── reservas/       # /dashboard/reservas — Tabla de reservas
│   └── api/
│       ├── geo/            # GET /api/geo — región por header x-vercel-ip-country
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
│   │   ├── layout/                       # Estructura del dashboard (header + sidebar)
│   │   │   ├── DashboardSidebar.tsx      # Sidebar con navegación + logout
│   │   │   └── DashboardHeader.tsx       # Header con breadcrumbs dinámicos
│   │   ├── charts/                       # Gráficas del resumen (Chart.js)
│   │   │   ├── IngresosChart.tsx         # Gráfica combinada ingresos/compras por mes
│   │   │   ├── PlanDistributionChart.tsx # Distribución por plan
│   │   │   └── ChartsClientLoader.tsx    # dynamic(..., { ssr:false }) para charts
│   │   ├── common/                       # Controles reutilizables de tablas
│   │   │   ├── SearchInput.tsx           # Búsqueda con debounce y URL params
│   │   │   └── Pagination.tsx            # Controles de paginación por URL params
│   │   ├── compras/                      # Componentes de dominio de compras
│   │   │   └── ComprasRecientesTable.tsx # Tabla de compras recientes del resumen
│   │   ├── clientes/                     # Componentes de dominio para /dashboard/clientes
│   │   │   └── ClienteDetailSheet.tsx    # Wrapper de detalles de cliente sobre un DetailSheet reusable
│   │   └── detail-sheet/                 # Base reusable para paneles de detalle
│   │       ├── DetailSheet.tsx
│   │       ├── DetailSheetErrorState.tsx
│   │       ├── DetailSheetSectionHeader.tsx
│   │       └── useDetailSheet.ts
│   └── ui/                 # 15 componentes shadcn/ui (ver sección abajo)
├── hooks/
│   ├── useCurrency.ts      # useRegion() — consulta /api/geo y cachea región 24h en cliente
│   └── use-mobile.ts       # useMobile() — detecta viewport móvil (shadcn)
├── lib/
│   ├── utils.ts            # cn() + scrollToSection()
│   ├── types.ts            # Tipos TypeScript: PlanId, PricingPlan, Feature, API request/response types
│   ├── constants.ts        # Constantes: SITE_CONFIG, PRICING_PLANS, FEATURES, TESTIMONIALS, FAQ, etc.
│   ├── icons.ts            # ICON_MAP centralizado (Lucide icons por nombre)
│   ├── whatsapp.ts         # getWhatsAppUrl() + WHATSAPP_URL constante
│   ├── paypal.ts           # PAYPAL_PRICES, PLAN_NAMES, getPrice(), getPayPalAccessToken(), getBaseUrl()
│   ├── geo.ts              # Resolución de país/región desde headers de Vercel
│   ├── email.ts            # sendPaymentConfirmationEmail() + sendBookingConfirmationEmail() + buildCalComUrl() via Brevo
│   ├── supabase.ts         # Clientes Supabase (browser, server, admin)
│   ├── dashboard.ts        # Funciones de data fetching para el dashboard (KPIs, tablas, RPCs)
│   ├── dashboard/          # Módulos compartidos de dashboard
│   │   ├── constants.ts    # BOOKING_STATUS_CONFIG centralizado
│   │   └── formatters.ts   # countryCodeToFlagUrl() + countryCodeToName()
│   └── database.types.ts   # Tipos TypeScript del esquema de DB (usar `type`, no `interface`)
├── proxy.ts                 # Protege /dashboard/* y redirige /login cuando ya hay sesión
├── supabase/
│   └── schema.sql          # SQL para crear tablas (customers, purchases, bookings)
├── docs/                   # Documentación del proyecto
└── public/
    └── images/             # Directorio para imágenes estáticas (actualmente vacío)
```

---

## Componentes shadcn/ui (`components/ui/`)

15 componentes activos, todos generados por shadcn CLI:

| Componente     | Usado en                                          |
|----------------|---------------------------------------------------|
| `accordion`    | `FAQSection.tsx`                                  |
| `badge`        | Dashboard pages, `PricingCard`, `HeroSection`     |
| `breadcrumb`   | `layout/DashboardHeader.tsx`                      |
| `button`       | Múltiples componentes de landing y dashboard      |
| `card`         | Múltiples componentes de landing y dashboard      |
| `input`        | `LoginForm.tsx`, `common/SearchInput.tsx`, sidebar |
| `label`        | `LoginForm.tsx`                                   |
| `separator`    | `layout/DashboardHeader.tsx`, sidebar             |
| `sheet`        | Usado internamente por `sidebar`                  |
| `sidebar`      | `layout/DashboardSidebar.tsx`, dashboard layout   |
| `skeleton`     | Dashboard pages, `charts/ChartsClientLoader.tsx`  |
| `sonner`       | `app/layout.tsx`                                  |
| `table`        | Dashboard pages, `compras/ComprasRecientesTable.tsx` |
| `tooltip`      | `app/layout.tsx`, dashboard layout, sidebar       |
| `vortex`       | `HeroSection.tsx` (fondo animado de partículas en la landing) |

> **Regla**: Evitar modificaciones extensivas a estos archivos. Para personalizar estilos, crear un wrapper o usar `cn()` con clases adicionales. Solo modificar si hay errores de lint/TypeScript.

---

## Path Alias

`@/*` apunta a la raíz del proyecto (configurado en `tsconfig.json`).

```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRICING_PLANS } from "@/lib/constants";
import type { PricingPlan } from "@/lib/types";
```

---

## Utilidades y Tipos Centralizados

### `lib/types.ts`
- `PlanId` — `"basic" | "gamer"`
- `PricingPlan`, `Feature`, `ProcessStep`, `Testimonial`, `FAQItem`
- `NavLink`, `SocialLinks`, `ContactInfo`
- `CreateOrderRequest/Response`, `CaptureOrderRequest/Response` — API PayPal
- `ApiError` — respuesta de error genérica

### `lib/constants.ts`
Toda la data estática del sitio: `SITE_CONFIG`, `PRICING_PLANS`, `FEATURES`, `TESTIMONIALS`, `FAQ`, etc. Usar `as const` para type safety.

### `lib/utils.ts`
- `cn()` — merge de clases Tailwind con clsx + tailwind-merge
- `scrollToSection()` — navegación suave a secciones por ID

### `lib/icons.ts`
`ICON_MAP` centralizado de Lucide icons por nombre de string. Evitar mapas duplicados en componentes.

### `lib/whatsapp.ts`
- `getWhatsAppUrl(message?)` — genera URL de WhatsApp con mensaje opcional
- `WHATSAPP_URL` — URL pre-calculada sin mensaje

### `hooks/useCurrency.ts`
`useRegion()` — devuelve `{ region, countryCode, loading }`. Consulta `GET /api/geo` (header `x-vercel-ip-country`) y cachea resultado por 24h.
