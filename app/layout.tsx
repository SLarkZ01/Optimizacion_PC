import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PayPalProvider from "@/components/shared/PayPalProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PCOptimize | Optimizacion Remota de Computadoras",
  description:
    "Servicio profesional de optimizacion remota de PCs. Limpieza, eliminacion de malware, actualizacion de drivers y mejora de rendimiento. Soporte 100% remoto.",
  keywords: [
    "optimizacion PC",
    "limpieza computadora",
    "eliminar malware",
    "mejorar rendimiento PC",
    "soporte tecnico remoto",
    "optimizar Windows",
  ],
  authors: [{ name: "PCOptimize" }],
  openGraph: {
    title: "PCOptimize | Optimizacion Remota de Computadoras",
    description:
      "Servicio profesional de optimizacion remota de PCs. Limpieza, eliminacion de malware y mejora de rendimiento.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <PayPalProvider>
          <TooltipProvider>
            {children}
            <Suspense fallback={null}>
              <Sonner />
            </Suspense>
          </TooltipProvider>
        </PayPalProvider>
      </body>
    </html>
  );
}
