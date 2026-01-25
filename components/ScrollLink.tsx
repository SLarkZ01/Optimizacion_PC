"use client";

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
  const scrollToSection = () => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button onClick={scrollToSection} className={className}>
      {children}
    </button>
  );
};

export default ScrollLink;
