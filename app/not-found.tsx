import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-lg">
        {/* 404 Number */}
        <h1 className="text-8xl md:text-9xl font-bold gradient-text mb-4">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Pagina no encontrada
        </h2>

        {/* Message */}
        <p className="text-muted-foreground mb-8">
          Lo sentimos, la pagina que buscas no existe o ha sido movida. No te
          preocupes, puedes volver al inicio.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="gradient-primary hover:opacity-90" asChild>
            <Link href="/">
              <Home className="mr-2 w-4 h-4" />
              Ir al Inicio
            </Link>
          </Button>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
