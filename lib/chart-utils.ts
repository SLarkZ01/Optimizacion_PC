// Utilidades compartidas para gráficas Chart.js del dashboard.
// Centraliza: registro de módulos, formateadores, tick helpers, y buildOptions base.
// (js-cache-function-results — instanciado una sola vez, fuera de cualquier componente)

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

// ---------------------------------------------------------------------------
// Registro centralizado — se llama una sola vez aunque ambos archivos lo importen.
// ChartJS.register() es idempotente; importar este módulo desde dos componentes
// lazy-loaded no causa doble registro.
// ---------------------------------------------------------------------------
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
);

// ---------------------------------------------------------------------------
// Formateador de moneda — instancia única (js-cache-function-results)
// ---------------------------------------------------------------------------
export const usdFormatter = new Intl.NumberFormat("en-US");

// ---------------------------------------------------------------------------
// Tick helper para ejes en USD
// ---------------------------------------------------------------------------
export function tickUSD(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value}`;
}

// ---------------------------------------------------------------------------
// Opciones de escala compartidas para gráficas con dos ejes (izquierdo USD,
// derecho cantidad). Los componentes pueden hacer spread y sobreescribir.
// ---------------------------------------------------------------------------
export function buildDualAxisScales(
  isMobile: boolean,
): ChartOptions<"bar">["scales"] {
  return {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { font: { size: 12 } },
    },
    yIngresos: {
      type: "linear",
      position: "left",
      display: !isMobile,
      grid: { color: "rgba(128,128,128,0.1)" },
      border: { display: false },
      ticks: {
        callback: (v) => tickUSD(v as number),
        font: { size: 11 },
        maxTicksLimit: 5,
      },
    },
    yTotal: {
      type: "linear",
      position: "right",
      display: !isMobile,
      grid: { display: false },
      border: { display: false },
      ticks: {
        precision: 0,
        font: { size: 11 },
        maxTicksLimit: 5,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Nota: para detectar viewport móvil en componentes cliente usa el hook
// `useIsMobile` desde `@/hooks/use-mobile`.
// No se re-exporta aquí porque los hooks React no pueden importarse desde
// módulos sin "use client".
// ---------------------------------------------------------------------------
