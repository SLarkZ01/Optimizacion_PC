# Arquitectura de App

- Ultima actualizacion: Marzo 2026
- Owner: Engineering

## Providers globales

El layout raiz (`app/layout.tsx`) envuelve la app con `TooltipProvider`, `Sonner` y `Analytics`.

`PayPalProvider` no es global: se carga solo en la landing para evitar costo de bundle en dashboard/login.

## Server vs Client

- Por defecto: Server Components
- Usar `"use client"` solo para hooks, handlers, APIs del navegador o librerias client-only

## Patrones de data fetching

- Dashboard separa KPIs y data de graficas para permitir streaming paralelo.
- Las funciones de `lib/server/dashboard/queries.ts` usan `React.cache()` para deduplicar lecturas por ciclo de render.

## Rendimiento

- Priorizar Server Components
- Lazy loading para componentes pesados
- Evitar re-renders innecesarios
