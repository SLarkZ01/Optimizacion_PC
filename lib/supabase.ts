// Utilidades de clientes Supabase para PCOptimize
// Cliente navegador: para Client Components ("use client")
// Cliente servidor: para Server Components, Route Handlers y Server Actions
// Cliente admin: para webhooks y API routes que necesitan permisos elevados

import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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
// necesiten permisos elevados. Usa createClient de @supabase/supabase-js
// directamente (no SSR) porque no necesita cookies ni sesión.
// ============================================================
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
