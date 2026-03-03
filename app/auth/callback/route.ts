import { createServerSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Ruta de callback para manejar el intercambio de código de auth
// Se usa cuando Supabase necesita confirmar email o manejar magic links
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si no hay código o hubo error, redirigir al login
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
