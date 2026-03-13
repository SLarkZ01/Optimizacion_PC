"use client";

// Input de búsqueda con debounce para las páginas del dashboard.
// Actualiza el parámetro ?q= en la URL sin recargar la página completa —
// el Server Component padre se re-ejecuta automáticamente con los nuevos searchParams.

import { useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchInput({
  placeholder = "Buscar por nombre o email...",
  debounceMs = 350,
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // El valor del input se almacena en un ref para no disparar re-renders
  // en cada tecla. El input es controlado via DOM directamente.
  const inputRef = useRef<HTMLInputElement>(null);

  // Valor canónico de la URL — fuente de verdad
  const urlQuery = searchParams.get("q") ?? "";

  // Sincronizar el DOM cuando cambia la URL externamente
  // (ej. botón atrás del navegador, limpiar búsqueda)
  // Usamos ref en lugar de estado para evitar re-renders desde el effect.
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== urlQuery) {
      inputRef.current.value = urlQuery;
    }
  }, [urlQuery]);

  const pushSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term.trim()) {
        params.set("q", term.trim());
      } else {
        params.delete("q");
      }
      // Volver a la página 1 al buscar
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Cancelar el debounce anterior
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => pushSearch(newValue), debounceMs);
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
    if (timerRef.current) clearTimeout(timerRef.current);
    pushSearch("");
  };

  // Limpiar el timer al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div role="search" className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        defaultValue={urlQuery}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-8"
        aria-label="Buscar"
      />
      {urlQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
