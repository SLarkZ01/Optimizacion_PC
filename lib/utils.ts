import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Scroll suave a una sección por su selector CSS (ej: "#precios").
 * Uso en Client Components para navegación intra-página.
 */
export function scrollToSection(href: string) {
  const element = document.querySelector(href);
  element?.scrollIntoView({ behavior: "smooth" });
}
