# Troubleshooting de Testing (Vitest)

- Ultima actualizacion: Marzo 2026
- Owner: Frontend

Guia rapida para interpretar salidas comunes de `bun run test`, `bun run test:run` y `bun run test:coverage`.

## 1) "stderr" o "stdout" en tests que pasan

### Sintoma

- Aparecen lineas como `stderr | ...` o `stdout | ...` durante la ejecucion.
- Al final todos los tests salen en verde.

### Causa

- No es un fallo del runner.
- Son `console.error`, `console.warn` o `console.log` ejecutados por el codigo probado.
- En este proyecto se testean rutas de error de PayPal/Cal.com/Supabase, por lo que esos logs son esperados en varios casos.

### Que hacer

- Si todos los tests pasan, no hay que corregir nada.
- Si quieres menos ruido en local: usa `bun run test:run`.
- Si quieres menos ruido en CI: ejecutar Vitest en modo silencioso.

## 2) "PASS Waiting for file changes..."

### Sintoma

- Vitest no termina y se queda escuchando cambios.

### Causa

- `bun run test` ejecuta Vitest en watch mode.

### Que hacer

- Para una sola corrida usa `bun run test:run`.
- Para cobertura usa `bun run test:coverage`.

## 3) ¿Tiene que ver con GitHub Actions o variables de entorno?

### Respuesta corta

- En la mayoria de casos anteriores: no.

### Detalle

- La suite actual usa mocks para dependencias externas (PayPal, Brevo, Supabase, fetch).
- El workflow CI ya define variables dummy suficientes para lint, typecheck, tests y build.
- Solo necesitarias secretos reales si agregas pruebas de integracion reales contra servicios externos.

## 4) Comandos recomendados por contexto

- Desarrollo interactivo: `bun run test`
- Verificacion rapida local: `bun run test:run`
- Calidad completa local: `bun run lint && bun run typecheck && bun run test:run && bun run test:coverage && bun run build`
- Pipeline CI (referencia): `.github/workflows/ci-cd.yml`

## 5) Politica de interpretacion rapida

- Si hay `stderr/stdout` pero el resumen final dice `Test Files ... passed`, es salida informativa.
- Si aparece `FAIL`, `failed`, o codigo de salida no-cero, revisar test por test.
