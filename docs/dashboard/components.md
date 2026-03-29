# Dashboard Componentes

- Ultima actualizacion: Marzo 2026
- Owner: Frontend

## Layout

- `DashboardSidebar.tsx`: navegacion principal y logout.
- `DashboardHeader.tsx`: trigger de sidebar y breadcrumb dinamico.
- `app/dashboard/precios/layout.tsx`: encabezado persistente de la seccion Precios.

## Charts

- `IngresosChart.tsx` y `PlanDistributionChart.tsx` son client-only.
- `ChartsClientLoader.tsx` usa `dynamic(..., { ssr: false })` para evitar hidratacion incorrecta.

## Tabla y detalle

- `SearchInput.tsx`: query param `q` con debounce.
- `Pagination.tsx`: query param `page`.
- `ClienteDetailSheet.tsx` y `detail-sheet/*`: detalle reusable con lazy fetch y retry.

## Precios

- `app/dashboard/precios/PricingForm.tsx`: formulario de precios editables por plan/region.
- `app/dashboard/precios/loading.tsx`: skeleton de carga para mantener percepcion de rendimiento.
- Incluye deteccion visual de campos modificados y bloqueo del boton guardar sin cambios.
