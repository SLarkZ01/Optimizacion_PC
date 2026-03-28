# Convenciones de Testing

- Ultima actualizacion: Marzo 2026
- Owner: Frontend

- Framework: Vitest (`jsdom` por defecto + `node` para rutas API/proxy).
- Tests junto al modulo (`*.test.ts`, `*.test.tsx`).
- Preferir pruebas de comportamiento de usuario.
- En React, usar Testing Library.
- Mockear integraciones externas (`fetch`, Supabase, PayPal, Brevo, Next navigation/server).
- Tests de server (`app/api/**`, `proxy.ts`, server actions) deben cubrir: input invalido, flujo exitoso, errores de dependencia y fallback seguro.
- Mantener fixtures/factories en utilidades compartidas para evitar duplicacion.
- Cobertura minima del repo configurada en Vitest con umbrales base: `statements >= 80`, `lines >= 80`, `functions >= 80`, `branches >= 65`.
