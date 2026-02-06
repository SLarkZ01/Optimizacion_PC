"use client";

import { cn, scrollToSection } from "@/lib/utils";

interface ScrollLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente cliente pequeño para scroll suave.
 * Extraído para mantener componentes padres como Server Components.
 * (server-serialization)
 */
const ScrollLink = ({ href, children, className }: ScrollLinkProps) => {
  return (
    <button onClick={() => scrollToSection(href)} className={cn("cursor-pointer", className)}>
      {children}
    </button>
  );
};

export default ScrollLink;
