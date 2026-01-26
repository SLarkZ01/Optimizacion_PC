"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";

// Hoisted scrollToSection function (avoids recreation on each render)
const scrollToElement = (href: string) => {
  const element = document.querySelector(href);
  element?.scrollIntoView({ behavior: "smooth" });
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    // Usar passive: true para mejor rendimiento de scroll (client-passive-event-listeners)
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoized handler to avoid recreation
  const scrollToSection = useCallback((href: string) => {
    setIsOpen(false);
    scrollToElement(href);
  }, []);

  // Stable handler for pricing section
  const handlePricingClick = useCallback(() => {
    scrollToSection("#precios");
  }, [scrollToSection]);

  // Stable handler for logo click
  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Toggle mobile menu
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 text-xl font-bold cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Monitor className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="gradient-text">{SITE_CONFIG.name}</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

{/* CTA Button */}
          <div className="hidden md:block">
            <Button
              onClick={handlePricingClick}
              className="gradient-primary hover:opacity-90 transition-opacity"
            >
              Optimizar Ahora
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground cursor-pointer"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden glass border-t border-border/50 py-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2 cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
<Button
                onClick={handlePricingClick}
                className="gradient-primary hover:opacity-90 transition-opacity mt-2"
              >
                Optimizar Ahora
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
