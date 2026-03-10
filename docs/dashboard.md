# Dashboard — Panel de Administración

Panel de administración protegido para gestionar clientes, compras y reservas de PCOptimize.

---

## Autenticación

- **Usuario único**: Un solo administrador accede al dashboard.
- **Credenciales**: Email + contraseña via Supabase Auth (`signInWithPassword`).
- **Login**: `/login` — Server Component wrapper (`page.tsx`) + Client Component (`LoginForm.tsx`) con `<Suspense>`.
- **Logout**: Server action `logout()` en `app/login/actions.ts`, invocado desde el sidebar.
- **Callback OAuth**: `/auth/callback` — intercambia código OAuth por sesión (requerido por Supabase SSR).

### Seguridad en doble capa

1. **Middleware** (`middleware.ts`): Intercepta todas las rutas `/dashboard/*`. Si no hay sesión válida, redirige a `/login?redirectTo=<ruta>`. También redirige `/login` → `/dashboard` si ya hay sesión activa.
   - Usa `getUser()` (valida JWT con el servidor) — nunca `getSession()` (solo lee el JWT localmente, inseguro).
2. **Defense-in-depth** (`app/dashboard/layout.tsx`): El layout del dashboard verifica la sesión con `supabase.auth.getUser()` server-side. Si falla, redirige a `/login`. Esta capa protege en caso de que el middleware sea bypassado.

---

## Rutas del Dashboard

| Ruta | Descripción | Función de data fetching |
|------|-------------|--------------------------|
| `/dashboard` | Resumen: 4 KPIs + gráfica de ingresos + distribución de planes + compras recientes | `getDashboardKPIs()` + `getDashboardChartData()` |
| `/dashboard/clientes` | Tabla paginada de clientes con conteo de compras | `getCustomers(page, search)` |
| `/dashboard/compras` | Tabla paginada de compras con plan, monto y estado | `getPurchases(page, search)` |
| `/dashboard/reservas` | Tabla paginada de reservas con fecha (formato 12h AM/PM), estado y cliente | `getBookings(page, search)` |

---

## Componentes (`components/dashboard/`)

### `DashboardSidebar.tsx`
Client Component. Sidebar colapsable (modo `"icon"`) con:
- Logo + nombre del panel en el header.
- Navegación a 4 secciones (Resumen, Clientes, Compras, Reservas) con íconos Lucide.
- Botón de logout en el footer (invoca server action `logout()` via `<form action={logout}>`).
- `isActive()` memoizada con `useCallback` para evitar re-renders innecesarios.
- Usa `SidebarProvider` de shadcn/ui (`components/ui/sidebar`).

### `DashboardHeader.tsx`
Client Component. Header con:
- `SidebarTrigger` para colapsar/expandir el sidebar.
- `Breadcrumb` dinámico generado a partir de `usePathname()`.

### `IngresosChart.tsx`
Client Component. Gráfica de barras (recharts) con ingresos mensuales de los últimos 6 meses.
- Usa `ChartContainer` + `ChartTooltip` de shadcn/ui (`components/ui/chart`).
- Props: `data: { mes: string; ingresos: number; total: number }[]`.
- **No importar directamente** desde Server Components — usar `IngresosChartDynamic` (ver `ChartsClientLoader`).

### `PlanDistributionChart.tsx`
Client Component. Gráfica de donut/pie (recharts) con distribución de ventas por plan.
- Usa `ChartContainer` + `ChartLegend` de shadcn/ui.
- Props: `data: { plan: string; total: number; ingresos: number }[]`.
- **No importar directamente** — usar `PlanDistributionChartDynamic`.

### `ChartsClientLoader.tsx`
Client Component. Wrapper que exporta las gráficas con `dynamic(..., { ssr: false })`:
```typescript
import { IngresosChartDynamic, PlanDistributionChartDynamic } from "@/components/dashboard/ChartsClientLoader";
```
- Evita errores de hidratación de recharts en SSR.
- Muestra un `Skeleton` (`components/ui/skeleton`) mientras carga el bundle.
- `ssr: false` solo es válido en Client Components — por eso existe este archivo separado.

### `ComprasRecientesTable.tsx`
Server Component. Tabla con las 5 compras más recientes.
- Muestra: cliente (nombre + email), plan, monto, estado (badge), fecha.
- Recibe `data: ComprasRecientesRow[]` como prop.

### `SearchInput.tsx`
Client Component. Input de búsqueda con debounce para las páginas del dashboard.
- Actualiza `?q=` en la URL (sin recargar la página) — el Server Component padre re-ejecuta con los nuevos `searchParams`.
- Resetea `?page=` a 1 al buscar.
- Usa `ref` en lugar de `useState` para evitar re-renders por cada tecla.
- Sincroniza el DOM cuando la URL cambia externamente (ej. botón atrás).
- Props: `placeholder?: string`, `debounceMs?: number` (default: `350`).

### `Pagination.tsx`
Client Component. Controles Anterior/Siguiente para las tablas paginadas.
- Actualiza `?page=` en la URL preservando `?q=`.
- Se oculta si `totalPages <= 1`.
- Muestra el rango actual (ej. "Mostrando 1–10 de 43").
- Props: `page: number`, `totalPages: number`, `total: number`, `pageSize: number`.

---

## Data Fetching (`lib/dashboard.ts`)

Todas las funciones:
- Usan `createAdminClient()` (service_role key) — bypasea RLS para acceso completo.
- Están envueltas en `React.cache()` para deduplicar llamadas dentro del mismo ciclo de render.
- Retornan valores vacíos/cero en caso de error (sin lanzar excepción).

### `getDashboardKPIs(): Promise<DashboardKPIs>`
3 conteos rápidos con `head: true` (no descarga filas). Corre en paralelo con `getDashboardChartData()` en la página de resumen, permitiendo streaming.

```typescript
{ totalClientes: number, totalCompras: number, totalReservas: number }
```

### `getDashboardChartData(): Promise<DashboardChartData>`
Datos para las gráficas y tabla de compras recientes. Más lento que los KPIs.
- Descarga compras completadas de los últimos 6 meses.
- Agrega en un solo loop: `ingresosTotales`, `comprasPorPlan`, `comprasPorMes`.
- Obtiene las últimas 5 compras para `comprasRecientes`.

```typescript
{
  ingresosTotales: number,
  comprasPorPlan: { plan: string; total: number; ingresos: number }[],
  comprasPorMes:  { mes: string; total: number; ingresos: number }[],
  comprasRecientes: ComprasRecientesRow[]
}
```

### `getCustomers(page?, search?): Promise<PaginatedResult<CustomerWithPurchaseCount>>`
Lista clientes paginados. Filtra con `.or()` nativo del SDK (email + nombre).

### `getPurchases(page?, search?): Promise<PaginatedResult<PurchaseWithCustomer>>`
Lista compras paginadas. Usa la RPC `search_purchases` porque el SDK no soporta `.or()` sobre relaciones con `!inner join`.

### `getBookings(page?, search?): Promise<PaginatedResult<BookingWithPurchase>>`
Lista reservas paginadas. Usa la RPC `search_bookings` que hace `LEFT JOIN` con `purchases` y `customers` — un booking puede existir sin compra asociada (`purchase_id` nullable). Filtra por nombre, email del cliente o `cal_booking_id`.

### Constante `PAGE_SIZE`
```typescript
export const PAGE_SIZE = 10; // registros por página
```

---

## Tipos Exportados

```typescript
// Entidades con relaciones
type CustomerWithPurchaseCount = DbCustomer & { purchase_count: number }
type PurchaseWithCustomer      = DbPurchase & { customers: Pick<DbCustomer, "name" | "email"> | null }
// purchases es null cuando el booking no tiene compra asociada (purchase_id nullable)
type BookingWithPurchase       = DbBooking  & { purchases: (Pick<DbPurchase, "plan_type" | "amount"> & { customers: ... }) | null }
type ComprasRecientesRow       = Pick<DbPurchase, "id" | "status" | "plan_type" | "amount" | "created_at"> & { customers: ... }

// Resultados
interface PaginatedResult<T>  { data: T[]; total: number; page: number; totalPages: number }
interface DashboardKPIs       { totalClientes: number; totalCompras: number; totalReservas: number }
interface DashboardChartData  { ingresosTotales: number; comprasPorPlan: ...; comprasPorMes: ...; comprasRecientes: ... }

// @deprecated — no usar
interface DashboardStats extends DashboardKPIs, DashboardChartData {}
```
