# Convenciones de Código

Guía de estilo y convenciones para el proyecto PCOptimize.

---

## Orden de Imports

```typescript
// 1. Directivas (siempre al inicio del archivo)
"use client";
// o
"use server";

// 2. React y Next.js
import * as React from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

// 3. Librerías externas
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

// 4. Internos con alias @/
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRICING_PLANS } from "@/lib/constants";
import type { PricingPlan } from "@/lib/types";
```

---

## Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componentes | PascalCase | `HeroSection.tsx`, `PricingCard.tsx` |
| Hooks | camelCase con prefijo `use` | `useCurrency.ts`, `use-mobile.ts` |
| Utilidades | camelCase | `utils.ts`, `whatsapp.ts` |
| Constantes | camelCase | `constants.ts`, `paypal.ts` |
| Tipos / Interfaces | PascalCase | `PricingPlan`, `ApiError` |
| Variables CSS | kebab-case | `--primary-foreground` |
| Rutas API | kebab-case | `/api/paypal/create-order` |

---

## Estructura de Componentes

### Server Component (por defecto)
```typescript
// Sin directiva — Server Component
import { PRICING_PLANS } from "@/lib/constants";
import PricingCard from "@/components/cards/PricingCard";
import type { PricingPlan } from "@/lib/types";

const PricingSection = () => {
  return (
    <section id="precios" className="py-20">
      {PRICING_PLANS.map((plan: PricingPlan) => (
        <PricingCard key={plan.id} plan={plan} />
      ))}
    </section>
  );
};

export default PricingSection;
```

### Client Component (solo si es necesario)
```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  title: string;
}

const HeroSection = ({ title }: HeroSectionProps) => {
  const handleClick = () => { /* ... */ };

  return (
    <section className="...">
      <Button onClick={handleClick}>{title}</Button>
    </section>
  );
};

export default HeroSection;
```

### Cuándo usar `"use client"`
Solo cuando el componente necesita:
- Hooks de React (`useState`, `useEffect`, `useRef`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- APIs del navegador (`window`, `document`, `localStorage`)
- Componentes de PayPal (`PayPalProvider`, `PayPalButtons`)
- Chart.js/Recharts u otras librerías que no soportan SSR

---

## TypeScript

### Reglas principales
- **Strict mode habilitado** — no usar `any`
- **Definir interfaces para props** de cada componente
- **Tipos compartidos** → centralizar en `lib/types.ts`
- **Tipos de DB** → en `lib/database.types.ts`, usar `type` (no `interface`)
- **`as const`** para arrays/objetos inmutables en `constants.ts`
- **`import type`** cuando solo se necesita el tipo (tree-shaking)

```typescript
// Correcto
interface PricingCardProps {
  plan: PricingPlan;
  region: "latam" | "international";
}
const PricingCard = ({ plan, region }: PricingCardProps) => { /* ... */ };

// Incorrecto
const PricingCard = ({ plan, region }: any) => { /* ... */ };
```

```typescript
// Tipos de DB: usar type, no interface
export type DbCustomer = Database["public"]["Tables"]["customers"]["Row"];

// Constantes inmutables
const PLAN_IDS = ["basic", "gamer"] as const;
export type PlanId = (typeof PLAN_IDS)[number]; // "basic" | "gamer"
```

---

## Manejo de Estilos

### `cn()` para clases condicionales
```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-class",
  variant === "primary" ? "primary-styles" : "secondary-styles"
)} />
```

### Clases utilitarias custom (definidas en `globals.css`)

| Clase | Descripción |
|-------|-------------|
| `gradient-primary` | Gradiente verde (#22C55E) → azul (#60A5FA) |
| `gradient-accent` | Gradiente naranja (#FB923C) → verde (#22C55E) |
| `gradient-text` | Texto con gradiente verde/azul (`-webkit-background-clip: text`) |
| `glow-primary` | Box shadow verde difuso |
| `glow-accent` | Box shadow naranja difuso |
| `glass` | Glassmorphism — fondo semitransparente con blur |
| `glass-card` | Glassmorphism — fondo de card con borde |
| `content-auto` | `content-visibility: auto` con `contain-intrinsic-size: auto 200px` (listas largas) |
| `content-auto-sm` | `content-visibility: auto` con `contain-intrinsic-size: auto 80px` (items de acordeón) |
| `animate-fade-in` | Fade in de 0.3s |
| `animate-shimmer` | Ola de luz shimmer de izquierda a derecha |

### Variables de color (tema oscuro por defecto)

| Variable | Valor | Uso en Tailwind |
|----------|-------|-----------------|
| `--primary` | Verde `#22C55E` | `text-primary`, `bg-primary/10`, `border-primary` |
| `--secondary` | Azul `#60A5FA` | `text-secondary`, `bg-secondary/10` |
| `--accent` | Naranja `#FB923C` | `text-accent`, `bg-accent/10` |
| `--muted` | Gris azulado | `bg-muted`, `text-muted-foreground` |
| `--destructive` | Rojo | `text-destructive`, `hover:bg-destructive/10` |
| `--border` | Gris oscuro | `border-border`, `border-border/50` |

---

## Recursos Centralizados

No duplicar datos — siempre importar desde la fuente canónica:

| Recurso | Ubicación | Exporta |
|---------|-----------|---------|
| Clases condicionales | `lib/utils.ts` | `cn()` |
| Scroll suave | `lib/utils.ts` | `scrollToSection()` |
| Íconos Lucide | `lib/icons.ts` | `ICON_MAP` |
| WhatsApp | `lib/whatsapp.ts` | `WHATSAPP_URL`, `getWhatsAppUrl()` |
| Datos estáticos | `lib/constants.ts` | `PRICING_PLANS`, `FEATURES`, `TESTIMONIALS`, etc. |
| Tipos compartidos | `lib/types.ts` | `PlanId`, `PricingPlan`, `Feature`, etc. |
| Precios PayPal | `lib/paypal.ts` | `PAYPAL_PRICES`, `getPrice()` |
| Emails | `lib/email.ts` | `sendPaymentConfirmationEmail()`, `sendBookingConfirmationEmail()`, `buildCalComUrl()` |
| Región / moneda | `hooks/useCurrency.ts` | `useRegion()` |
| Data dashboard | `lib/dashboard.ts` | `getDashboardKPIs()`, `getCustomers()`, etc. |
| Formateadores dashboard | `lib/dashboard/formatters.ts` | `countryCodeToFlagUrl()`, `countryCodeToName()` |
| Constantes dashboard | `lib/dashboard/constants.ts` | `BOOKING_STATUS_CONFIG` |

---

## Checklist — Nuevo Componente

- [ ] ¿Necesita `"use client"`? Si no usa hooks ni event handlers, dejarlo como Server Component.
- [ ] Definir `interface ComponentNameProps {}` con TypeScript.
- [ ] Usar `cn()` para todas las clases condicionales.
- [ ] Importar componentes base desde `@/components/ui/`.
- [ ] Mover tipos reutilizables a `lib/types.ts`.
- [ ] Ubicar en la carpeta correcta (`sections/`, `cards/`, `shared/`, `dashboard/`).

## Checklist — Nueva Ruta API

- [ ] Usar `NextResponse.json()` para todas las respuestas.
- [ ] Definir interface TypeScript para el body del request.
- [ ] Verificar variables de entorno al inicio; retornar HTTP 500 si faltan.
- [ ] Envolver en `try/catch` y loguear errores con contexto.
- [ ] **Webhooks**: verificar firma/secret antes de procesar.
- [ ] **Operaciones Supabase**: usar `createAdminClient()` (service_role) para escrituras desde el servidor.
- [ ] Eventos no relevantes en webhooks → retornar HTTP 200 inmediatamente (evita reintentos).

---

## Testing (Vitest)

Infra base de testing configurada con:
- `vitest.config.ts` — entorno `jsdom`, `globals: true`, `setupFiles`
- `vitest.setup.ts` — import de `@testing-library/jest-dom/vitest`
- `tsconfig.json` — tipos `vitest/globals` y `vitest/jsdom`

### Convenciones de tests

- Ubicar tests junto al módulo probado con sufijo `.test.ts` o `.test.tsx`
- Priorizar pruebas de comportamiento (qué ve/hace el usuario) sobre detalles internos
- Para componentes React, usar `@testing-library/react`
- Evitar acoplar tests a implementación interna o clases CSS no funcionales

### Comandos de tests

```bash
bun run test       # watch mode
bun run test:run   # ejecución única (útil para CI)
```
