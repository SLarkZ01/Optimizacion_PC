# Estructura del Proyecto

## Árbol de Directorios

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
│   │   ├── ComprasRecientesTable.tsx     # Tabla de compras recientes para el resumen
│   │   ├── ChartsClientLoader.tsx        # Wrapper client-side para carga dinámica (ssr:false) de las gráficas
│   │   ├── SearchInput.tsx               # Input de búsqueda con debounce, actualiza ?q= en la URL
│   │   ├── Pagination.tsx                # Controles de paginación, actualiza ?page= en la URL
│   │   ├── clientes/                     # Componentes de dominio para /dashboard/clientes
│   │   │   └── ClienteDetailSheet.tsx    # Wrapper de detalles de cliente sobre un DetailSheet reusable
│   │   └── detail-sheet/                 # Base reusable para paneles de detalle
│   │       ├── DetailSheet.tsx
│   │       ├── DetailSheetErrorState.tsx
│   │       ├── DetailSheetSectionHeader.tsx
│   │       └── useDetailSheet.ts
│   └── ui/                 # 15 componentes shadcn/ui (ver sección abajo)
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
│   ├── email.ts            # sendPaymentConfirmationEmail() + sendBookingConfirmationEmail() + buildCalComUrl() via Brevo
│   ├── supabase.ts         # Clientes Supabase (browser, server, admin)
│   ├── dashboard.ts        # Funciones de data fetching para el dashboard
│   └── database.types.ts   # Tipos TypeScript del esquema de DB (usar `type`, no `interface`)
├── middleware.ts            # Protege /dashboard/* (redirige a /login si no autenticado)
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
| `breadcrumb`   | `DashboardHeader.tsx`                             |
| `button`       | Múltiples componentes de landing y dashboard      |
| `card`         | Múltiples componentes de landing y dashboard      |
| `chart`        | `IngresosChart.tsx`, `PlanDistributionChart.tsx`  |
| `input`        | `LoginForm.tsx`, `SearchInput.tsx`, sidebar       |
| `label`        | `LoginForm.tsx`                                   |
| `separator`    | `DashboardHeader.tsx`, sidebar                    |
| `sheet`        | Usado internamente por `sidebar`                  |
| `sidebar`      | `DashboardSidebar.tsx`, dashboard layout          |
| `skeleton`     | Dashboard pages, `ChartsClientLoader.tsx`         |
| `sonner`       | `app/layout.tsx`                                  |
| `table`        | Dashboard pages, `ComprasRecientesTable.tsx`      |
| `tooltip`      | `app/layout.tsx`, dashboard layout, sidebar       |

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
`useRegion()` — devuelve `{ region, countryCode, loading }`. Detecta la región del usuario por IP para mostrar precios diferenciados.
