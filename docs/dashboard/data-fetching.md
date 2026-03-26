# Dashboard Data Fetching

- Ultima actualizacion: Marzo 2026
- Owner: Backend

Funciones en `lib/dashboard.ts`:

- usan `createAdminClient()` para acceso completo
- usan `React.cache()` para deduplicar lecturas
- retornan fallback seguro en error

Funciones clave:

- `getDashboardKPIs()`
- `getDashboardChartData()`
- `getCustomers(page, search)`
- `getPurchases(page, search)`
- `getBookings(page, search)`

Constante de paginacion:

- `PAGE_SIZE = 10`
