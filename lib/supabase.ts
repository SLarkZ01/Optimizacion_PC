// Utilidades de clientes Supabase para PCOptimize
// Cliente navegador: para Client Components ("use client")
// Cliente servidor: para Server Components, Route Handlers y Server Actions

import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

// ============================================================
// Cliente navegador (Client Components)
// ============================================================
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ============================================================
// Cliente servidor (Server Components, Route Handlers, Server Actions)
// ============================================================
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll se llama desde un Server Component donde las cookies
            // no se pueden establecer. Es seguro ignorar si el middleware
            // maneja el refresco de sesión.
          }
        },
      },
    },
  );
}

// ============================================================
// Cliente admin (solo servidor, omite RLS)
// Usar únicamente en webhooks, server actions o API routes que
// necesiten permisos elevados.
// ============================================================
export function createAdminClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
