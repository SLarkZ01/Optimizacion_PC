import { NextResponse } from "next/server";
import { getPricingMatrix } from "@/lib/server/pricing/queries";

export async function GET() {
  try {
    const pricing = await getPricingMatrix();
    return NextResponse.json({ pricing });
  } catch (error) {
    console.error("Error en GET /api/pricing:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los precios" },
      { status: 500 },
    );
  }
}
