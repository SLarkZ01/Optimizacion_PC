# Path Alias y Recursos Compartidos

- Ultima actualizacion: Marzo 2026
- Owner: Frontend

## Path alias

- `@/*` apunta a la raiz del proyecto (configurado en `tsconfig.json`).

## Recursos centralizados

- `lib/utils/cn.ts`: `cn()`, `scrollToSection()`
- `lib/ui/icons.ts`: `ICON_MAP`
- `lib/config/site.ts`: datos estaticos del sitio
- `lib/domain/types.ts`: tipos de dominio compartidos
- `lib/integrations/paypal.ts`: precios y helpers de PayPal
- `lib/integrations/email.ts`: helpers de emails
- `lib/server/dashboard/queries.ts`: queries server-only del panel
- `lib/dashboard/*`: constantes, formatters y chart utils del panel
