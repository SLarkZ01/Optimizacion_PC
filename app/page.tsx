import dynamic from "next/dynamic";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import AboutSection from "@/components/sections/AboutSection";

// Dynamic imports for below-the-fold sections (improves initial bundle size)
const ProcessSection = dynamic(
  () => import("@/components/sections/ProcessSection"),
  { loading: () => <div className="py-20 md:py-32 animate-pulse bg-muted/10" /> }
);
const PricingSection = dynamic(
  () => import("@/components/sections/PricingSection"),
  { loading: () => <div className="py-20 md:py-32 animate-pulse bg-card/30" /> }
);
const TestimonialsSection = dynamic(
  () => import("@/components/sections/TestimonialsSection"),
  { loading: () => <div className="py-20 md:py-32 animate-pulse bg-muted/10" /> }
);
const FAQSection = dynamic(
  () => import("@/components/sections/FAQSection"),
  { loading: () => <div className="py-20 md:py-32 animate-pulse bg-card/30" /> }
);
const CTASection = dynamic(
  () => import("@/components/sections/CTASection"),
  { loading: () => <div className="py-20 md:py-32 animate-pulse bg-muted/10" /> }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <Suspense fallback={<div className="py-20 md:py-32" />}>
          <ProcessSection />
          <PricingSection />
          <TestimonialsSection />
          <FAQSection />
          <CTASection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
