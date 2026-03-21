# Arquitectura

## Providers Globales (`app/layout.tsx`)

El layout raíz envuelve toda la app con `TooltipProvider`, `Sonner` y `Analytics`:

```tsx
<TooltipProvider>
  {children}
  <Suspense fallback={null}>
    <Sonner />
  </Suspense>
</TooltipProvider>
<Analytics />
```

`PayPalProvider` no es global: está scopeado a `app/page.tsx` para cargar el SDK solo en la landing y evitar costo de bundle en dashboard/login.

**Font**: Inter (`next/font/google`) con variable CSS `--font-inter`, aplicada en `<body>` como `font-sans`.

---

## Server vs Client Components

- **Por defecto**: Server Components (sin directiva)
- **Usar `"use client"`** solo cuando sea necesario:
  - Hooks de React (`useState`, `useEffect`, etc.)
  - Event handlers (`onClick`, `onChange`, etc.)
  - APIs del navegador (`window`, `document`, `localStorage`)
  - Componentes de PayPal (`PayPalProvider`, `PayPalButtons`)
  - Wrappers de `dynamic(..., { ssr: false })` (ej. `ChartsClientLoader.tsx`)

---

## Patrones de Data Fetching

### Dashboard — dos funciones separadas para streaming paralelo

`getDashboardKPIs()` resuelve antes (solo conteos con `head:true`) y `getDashboardChartData()` resuelve después (agrega filas). Esto permite que los KPIs aparezcan antes en pantalla mientras las gráficas cargan.

Todas las funciones de `lib/dashboard.ts` usan `React.cache()` para deduplicar llamadas idénticas dentro del mismo ciclo de render.

Las utilidades compartidas de dashboard viven en `lib/dashboard/*`:
- `constants.ts` (estado de reservas)
- `formatters.ts` (banderas y nombres de país)

### Paginación y búsqueda

Las tablas del dashboard usan la URL como fuente de verdad:
- `?q=` — término de búsqueda (actualizado por `SearchInput` con debounce de 350ms)
- `?page=` — página actual (actualizado por `Pagination`)

Los Server Components leen estos `searchParams` y pasan los resultados como props.

### Lazy loading de gráficas

`ChartsClientLoader.tsx` exporta versiones `dynamic(..., { ssr: false })` de las gráficas de recharts. Recharts usa APIs del DOM que fallan en SSR. El Server Component `app/dashboard/page.tsx` importa desde `ChartsClientLoader` para evitar el error.

---

## Rutas API

### Patrón general

```typescript
// Verificar variables de entorno primero
// Tipar el body del request con una interface
// Envolver en try/catch con logging de contexto
// Usar NextResponse.json() para respuestas
// Para webhooks: verificar firma/secret antes de procesar
// Para Supabase: usar createAdminClient() (service role, bypassa RLS)
```

### Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/paypal/create-order` | Crea orden PayPal REST v2, devuelve `orderID` |
| `POST` | `/api/paypal/capture-order` | Captura pago, guarda en Supabase, envía email Brevo |
| `POST` | `/api/webhooks/paypal` | Webhook de seguridad PayPal con verificación HMAC |
| `POST` | `/api/webhooks/calcom` | Webhook Cal.com: guarda booking, envía email RustDesk |
| `GET`  | `/auth/callback` | Intercambio de código OAuth para Supabase Auth |

---

## Optimización de Rendimiento

### Prioridades

1. Evitar re-renders innecesarios (usar `useRef` en lugar de `useState` cuando no se necesita re-render)
2. Usar Server Components cuando sea posible
3. Lazy loading para componentes pesados (`dynamic` con `ssr: false`)
4. Optimizar imágenes con `next/image`
5. Usar `content-auto` / `content-auto-sm` para listas largas fuera del viewport

### Recursos

- Best practices de React/Next.js: `.agents/skills/vercel-react-best-practices/`
- Guía de diseño de interfaces: `.agents/skills/interface-design/`
