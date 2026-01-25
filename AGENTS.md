# AGENTS.md - Guía para Agentes de Código

> **Nota de mantenimiento**: Este archivo debe actualizarse cuando cambien las convenciones,
> se agreguen tests, o evolucione el stack tecnológico del proyecto.
> Última actualización: Enero 2026

## Descripción del Proyecto

Landing page para **PCOptimize**, un servicio de optimización remota de computadoras.
Construido con Next.js 16.1.4, React 19 y TypeScript usando el App Router.

---

## Comandos de Build/Lint/Test

```bash
# Desarrollo
bun dev                    # Servidor de desarrollo en http://localhost:3000

# Producción
bun run build              # Build de producción
bun run start              # Iniciar servidor de producción

# Linting
bun run lint               # Ejecutar ESLint (next/core-web-vitals + typescript)

# Tests (NO CONFIGURADOS ACTUALMENTE)
# TODO: Agregar Vitest o Jest cuando se implementen tests
```

### Notas sobre Tests
- Actualmente no hay infraestructura de tests configurada
- Cuando se agreguen, actualizar esta sección con comandos para:
  - Ejecutar todos los tests
  - Ejecutar un test individual
  - Ejecutar tests en modo watch

---

## Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── layout.tsx          # Layout raíz con providers globales
│   ├── page.tsx            # Página principal (landing)
│   ├── globals.css         # Estilos globales y variables CSS
│   ├── exito/              # Ruta /exito (página de confirmación)
│   └── not-found.tsx       # Página 404 personalizada
├── components/
│   ├── ui/                 # Componentes shadcn/ui (NO MODIFICAR DIRECTAMENTE)
│   ├── sections/           # Secciones de la landing (Hero, Features, etc.)
│   └── *.tsx               # Componentes reutilizables (Cards, Navbar, Footer)
├── hooks/                  # Custom React hooks
├── lib/
│   ├── utils.ts            # Utilidad cn() para clases de Tailwind
│   ├── types.ts            # Definiciones de tipos TypeScript
│   └── constants.ts        # Constantes y configuración del sitio
└── public/                 # Archivos estáticos
```

### Path Alias
- `@/*` apunta a la raíz del proyecto (configurado en `tsconfig.json`)
- Ejemplo: `import { Button } from "@/components/ui/button"`

---

## Stack Tecnológico

| Tecnología       | Versión  | Notas                                    |
|------------------|----------|------------------------------------------|
| Next.js          | 16.1.4   | App Router, Server Components por defecto|
| React            | 19.2.3   | React 19 con nuevas características      |
| TypeScript       | ^5       | Strict mode habilitado                   |
| Tailwind CSS     | ^4       | v4 con PostCSS (sin tailwind.config)     |
| shadcn/ui        | new-york | 50+ componentes UI basados en Radix      |
| Bun              | -        | Gestor de paquetes (usar `bun` no `npm`) |

### Librerías Principales
- **UI**: Radix UI primitives, Lucide React (iconos)
- **Forms**: React Hook Form + Zod (validación)
- **Notificaciones**: Sonner (toasts)
- **Utilidades**: clsx, tailwind-merge, class-variance-authority

---

## Convenciones de Código

### Imports (orden recomendado)
```typescript
// 1. Directivas ("use client", "use server")
"use client";

// 2. Imports de React/Next
import * as React from "react";
import type { Metadata } from "next";

// 3. Imports de librerías externas
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

// 4. Imports internos con alias @/
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRICING_PLANS } from "@/lib/constants";
import type { PricingPlan } from "@/lib/types";
```

### Nomenclatura
- **Componentes**: PascalCase (`HeroSection.tsx`, `PricingCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`use-toast.ts`)
- **Utilidades/Constantes**: camelCase (`utils.ts`, `constants.ts`)
- **Tipos/Interfaces**: PascalCase (`PricingPlan`, `Feature`)
- **Variables CSS**: kebab-case (`--primary-foreground`)

### Estructura de Componentes
```typescript
// Componente de sección (con interactividad)
"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  // Funciones auxiliares primero
  const handleClick = () => { /* ... */ };

  return (
    <section className="...">
      {/* JSX */}
    </section>
  );
};

export default HeroSection;
```

### TypeScript
- **Strict mode habilitado**: No usar `any`, definir tipos explícitos
- **Interfaces para props**: Definir siempre `interface ComponentProps {}`
- **Tipos en lib/types.ts**: Centralizar tipos compartidos
- **`as const`**: Usar para arrays/objetos inmutables en constants.ts

```typescript
// Correcto
interface PricingCardProps {
  plan: PricingPlan;
  currency: Currency;
}

// Evitar
const PricingCard = ({ plan, currency }: any) => { /* ... */ }
```

### Manejo de Estilos

#### Usar siempre `cn()` para clases condicionales
```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-class",
  variant === "primary" ? "primary-styles" : "secondary-styles"
)} />
```

#### Clases utilitarias custom (definidas en globals.css)
- `gradient-primary` - Gradiente azul a morado
- `gradient-text` - Texto con gradiente
- `glow-primary` - Efecto glow azul
- `glass` / `glass-card` - Efecto glassmorphism

#### Variables de color (tema oscuro por defecto)
- `--primary`: Azul (#3B82F6)
- `--secondary`: Morado (#8B5CF6)
- `--accent`: Verde (#10B981)
- Usar: `text-primary`, `bg-primary/10`, `border-primary`

---

## Patrones y Arquitectura

### Server vs Client Components
- **Por defecto**: Server Components (sin directiva)
- **Usar `"use client"`** solo cuando sea necesario:
  - Hooks de React (useState, useEffect, etc.)
  - Event handlers (onClick, onChange, etc.)
  - APIs del navegador (window, document)

### Componentes shadcn/ui
- Ubicación: `components/ui/`
- **Generados por shadcn CLI** - Evitar modificaciones extensivas
- **SÍ modificar** cuando haya errores de lint/TypeScript (ej: interfaces vacías, funciones impuras)
- Para personalizar estilos, crear wrapper o usar `cn()` con clases adicionales

### Constantes Centralizadas
- Toda la data estática debe ir en `lib/constants.ts`
- Incluye: `SITE_CONFIG`, `PRICING_PLANS`, `FEATURES`, `TESTIMONIALS`, etc.
- Usar `as const` para type safety

### Tipos Centralizados
- Definir interfaces en `lib/types.ts`
- Importar con: `import type { PricingPlan } from "@/lib/types"`

---

## Recursos Adicionales

### Best Practices de Rendimiento
Ver documentación completa en: `.agents/skills/vercel-react-best-practices/`
- 57 reglas de optimización organizadas por categoría
- Ejemplos de código correcto vs incorrecto
- Métricas de impacto por regla

### Prioridades de Optimización
1. Evitar re-renders innecesarios
2. Usar Server Components cuando sea posible
3. Lazy loading para componentes pesados
4. Optimizar imágenes con next/image

---

## Checklist para Nuevos Componentes

- [ ] Definir si necesita `"use client"` o puede ser Server Component
- [ ] Crear interface para props con TypeScript
- [ ] Usar `cn()` para clases condicionales
- [ ] Importar desde `@/components/ui/` para componentes base
- [ ] Agregar tipos a `lib/types.ts` si son reutilizables
- [ ] Seguir estructura de carpetas existente
