# Dashboard Componentes

- Ultima actualizacion: Marzo 2026
- Owner: Frontend

## Layout

- `DashboardSidebar.tsx`: navegacion principal y logout.
- `DashboardHeader.tsx`: trigger de sidebar y breadcrumb dinamico.

## Charts

- `IngresosChart.tsx` y `PlanDistributionChart.tsx` son client-only.
- `ChartsClientLoader.tsx` usa `dynamic(..., { ssr: false })` para evitar hidratacion incorrecta.

## Tabla y detalle

- `SearchInput.tsx`: query param `q` con debounce.
- `Pagination.tsx`: query param `page`.
- `ClienteDetailSheet.tsx` y `detail-sheet/*`: detalle reusable con lazy fetch y retry.
