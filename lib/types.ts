// PCOptimize Type Definitions

export interface PricingPlan {
  id: string;
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
