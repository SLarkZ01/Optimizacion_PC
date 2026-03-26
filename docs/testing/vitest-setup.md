# Testing con Vitest

- Ultima actualizacion: Marzo 2026
- Owner: Frontend

Base de testing configurada con:

- `vitest.config.ts`: `jsdom`, `globals`, `setupFiles`
- `vitest.setup.ts`: `@testing-library/jest-dom/vitest`
- `tsconfig.json`: tipos `vitest/globals` y `vitest/jsdom`

## Comandos

```bash
bun run test
bun run test:run
```

## Convencion

- Ubicar tests junto al modulo probado usando `.test.ts` o `.test.tsx`.
