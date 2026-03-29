# Dashboard Data Fetching

- Ultima actualizacion: Marzo 2026
- Owner: Backend

Funciones en `lib/server/dashboard/queries.ts`:

- usan `createAdminClient()` para acceso completo
- usan `React.cache()` para deduplicar lecturas
- retornan fallback seguro en error

Funciones clave:

- `getDashboardKPIs()`
- `getDashboardChartData()`
- `getCustomers(page, search)`
- `getPurchases(page, search)`
- `getBookings(page, search)`

Funciones en `lib/server/pricing/queries.ts`:

- `getPricingRules()`
- `getPricingMatrix()`
- `getCheckoutPriceUSD(planId, region)`

Mutacion de precios:

- `lib/server/pricing/actions.ts` -> `updatePricingRulesAction()` (upsert en `pricing_rules`, revalidate de `/` y `/dashboard/precios`).

Constante de paginacion:

- `PAGE_SIZE = 10`
