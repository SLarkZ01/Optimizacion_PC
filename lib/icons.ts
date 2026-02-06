import {
  Zap,
  Shield,
  Trash2,
  Monitor,
  Clock,
  Lock,
  Star,
  CreditCard,
  Calendar,
  Wifi,
  CheckCircle,
  Circle,
  type LucideIcon,
} from "lucide-react";

/**
 * Mapa centralizado de iconos usados en constantes (FEATURES, PROCESS_STEPS).
 * Evita importar todo lucide-react en cada componente (bundle-barrel-imports).
 * Al agregar un nuevo icono a constants.ts, registrarlo aquí.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Shield,
  Trash2,
  Monitor,
  Clock,
  Lock,
  Star,
  CreditCard,
  Calendar,
  Wifi,
  CheckCircle,
  Circle,
};

/** Icono fallback cuando el nombre no se encuentra en el mapa */
export const DEFAULT_ICON = Circle;
