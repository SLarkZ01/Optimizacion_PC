# Flujo de Negocio

- Ultima actualizacion: Marzo 2026
- Owner: Product

1. Cliente elige plan en la landing.
2. Se crea orden en PayPal y el cliente completa el pago.
3. Tras captura del pago, se guarda compra/cliente y se envia email con link de Cal.com.
4. Cliente agenda su sesion remota.
5. Al confirmar booking, se envia email con instrucciones de RustDesk.
6. Se realiza la sesion de optimizacion remota (aprox. 90 min).

## Dependencias del flujo

- Pago: `docs/integrations/paypal.md`
- Email transaccional: `docs/integrations/brevo.md`
- Agendamiento: `docs/integrations/calcom.md`
- Acceso remoto: `docs/integrations/rustdesk.md`
