# Variables de Entorno

- Ultima actualizacion: Marzo 2026
- Owner: Backend

Copiar `.env.example` a `.env.local` y completar valores reales.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...

# Brevo
BREVO_API_KEY=...
BREVO_FROM_NAME=PCOptimize
BREVO_FROM_EMAIL=hola@pcoptimize.com

# Cal.com
NEXT_PUBLIC_CAL_COM_URL=https://cal.com/tu-usuario
CALCOM_WEBHOOK_SECRET=...

# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## Regla de seguridad

- Nunca subir `.env.local` al repositorio.
