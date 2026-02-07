// Definiciones de tipos de PCOptimize

export type PlanId = "basic" | "gamer" | "premium";

export interface PricingPlan {
  id: PlanId;
  name: string;
  priceUSD: number;
  duration: string;
  description: string;
  features: readonly string[];
  popular: boolean;
  cta: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: number;
  name: string;
  country: string;
  avatar: string;
  rating: number;
  text: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface Currency {
  symbol: string;
  rate: number;
  name: string;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
}

export interface ContactInfo {
  email: string;
  whatsapp: string;
  whatsappMessage: string;
}

// ============================================================
// Tipos para la API de Checkout (Stripe)
// ============================================================

/** Cuerpo de la solicitud POST /api/checkout */
export interface CheckoutRequest {
  planId: PlanId;
  currencyCode: string;
}

/** Respuesta exitosa de POST /api/checkout */
export interface CheckoutResponse {
  url: string;
}

/** Respuesta de error de la API */
export interface ApiError {
  error: string;
}
