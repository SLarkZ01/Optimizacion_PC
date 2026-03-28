# Comandos del Proyecto

- Ultima actualizacion: Marzo 2026
- Owner: Engineering

```bash
# Desarrollo
bun run dev

# Produccion
bun run build
bun run start

# Calidad
bun run lint
bun run typecheck

# Testing
bun run test
bun run test:run
bun run test:coverage
```

## Notas

- `test` ejecuta Vitest en watch mode.
- `test:run` ejecuta una pasada unica y falla si hay errores.
- `test:coverage` genera cobertura (`text`, `html`, `json-summary`).
