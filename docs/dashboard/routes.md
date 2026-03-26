# Dashboard Rutas

- Ultima actualizacion: Marzo 2026
- Owner: Admin Panel

| Ruta | Descripcion | Data fetching |
|---|---|---|
| `/dashboard` | KPIs, graficas y compras recientes | `getDashboardKPIs()`, `getDashboardChartData()` |
| `/dashboard/clientes` | Tabla paginada de clientes | `getCustomers(page, search)` |
| `/dashboard/compras` | Tabla paginada de compras | `getPurchases(page, search)` |
| `/dashboard/reservas` | Tabla paginada de reservas | `getBookings(page, search)` |
