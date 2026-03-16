"use server";

// Server Actions del dashboard admin.
// Marcadas con "use server" — Next.js las serializa como POST requests
// internos, type-safe end-to-end, sin necesidad de Route Handlers.
// Se ejecutan en el servidor: tienen acceso al service_role de Supabase
// y nunca exponen secretos al cliente.

import { getCustomerDetails } from "@/lib/dashboard";
import type { CustomerDetails } from "@/lib/dashboard";

/**
 * Server Action: obtiene los detalles completos de un cliente.
 * Llamada desde Client Components al abrir el Sheet de detalles.
 * La función getCustomerDetails usa React.cache(), por lo que llamadas
 * repetidas al mismo ID en el mismo ciclo de render son deduplicadas.
 *
 * @param customerId - UUID del cliente
 * @returns CustomerDetails | null
 */
export async function getCustomerDetailsAction(
  customerId: string,
): Promise<CustomerDetails | null> {
  // Validación básica del formato UUID para evitar queries innecesarias
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(customerId)) {
    return null;
  }

  return getCustomerDetails(customerId);
}
