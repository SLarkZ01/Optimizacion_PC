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
```

## Notas

- `test` ejecuta Vitest en watch mode.
- `test:run` ejecuta una pasada unica y permite continuar aun si no hay tests (`--passWithNoTests`).
