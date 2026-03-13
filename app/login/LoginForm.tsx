"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Monitor, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "./actions";

const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Fondo con efecto sutil */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          {/* Logo / Ícono */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <Monitor className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              Panel de Administración
            </CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              Ingresa tus credenciales para acceder al dashboard de PCOptimize
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {/* Mensaje de error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Campo de redirección oculto */}
            {redirectTo && (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@pcoptimize.com"
                  required
                  autoComplete="email"
                  disabled={isPending}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isPending}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón de login */}
            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Nota de seguridad */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Acceso restringido solo para administradores de PCOptimize
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
