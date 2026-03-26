# Convenciones API Routes

- Ultima actualizacion: Marzo 2026
- Owner: Backend

- Validar env vars al inicio.
- Tipar body de request.
- Manejar errores con `try/catch`.
- Responder con `NextResponse.json()`.
- En webhooks, validar firma/secret antes de procesar.
- Para escrituras en servidor, usar `createAdminClient()`.
