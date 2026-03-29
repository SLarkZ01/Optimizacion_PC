// Funciones de obtención de datos del servidor para el dashboard admin
// Todas usan createAdminClient() que omite RLS (service_role)
// para tener acceso completo a los datos de negocio.
//
// React.cache() deduplica llamadas idénticas dentro del mismo ciclo de render,
// evitando consultas duplicadas cuando varios Server Components piden los mismos datos.

import { cache } from "react";
import { createAdminClient } from "@/lib/integrations/supabase";
import type {
  DbCustomer,
  DbPurchase,
  DbBooking,
} from "@/lib/domain/database.types";

// ============================================================
// Constantes
// ============================================================

export const PAGE_SIZE = 10;

// ============================================================
// Tipos para datos del dashboard
// ============================================================

/** Cliente con conteo de compras (sin cargar los objetos completos) */
export type CustomerWithPurchaseCount = DbCustomer & {
  purchase_count: number;
};

export type PurchaseWithCustomer = DbPurchase & {
  customers: Pick<DbCustomer, "name" | "email"> | null;
};

export type BookingWithPurchase = DbBooking & {
  purchases: (Pick<DbPurchase, "plan_type" | "amount"> & {
    customers: Pick<DbCustomer, "name" | "email"> | null;
  }) | null;
};

/** Fila estrecha para la tabla de compras recientes (solo campos renderizados) */
export type ComprasRecientesRow = Pick<
  DbPurchase,
  | "id"
  | "status"
  | "plan_type"
  | "gross_amount_usd"
  | "paypal_fee_usd"
  | "net_amount_usd"
  | "amount"
  | "created_at"
> & {
  customers: Pick<DbCustomer, "name" | "email"> | null;
};

function getGrossAmountUSD(purchase: {
  gross_amount_usd?: number | null;
  amount: number;
}): number {
  return purchase.gross_amount_usd ?? purchase.amount;
}

function getNetAmountUSD(purchase: {
  net_amount_usd?: number | null;
  gross_amount_usd?: number | null;
  amount: number;
}): number {
  return purchase.net_amount_usd ?? purchase.gross_amount_usd ?? purchase.amount;
}

/**
 * Detalles completos de un cliente: sus datos, compras y reservas.
 * Retornado por la RPC get_customer_details — una sola roundtrip a Postgres.
 */
export type CustomerDetails = {
  customer: DbCustomer;
  purchases: DbPurchase[];
  bookings: DbBooking[];
};

/** Resultado paginado genérico */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardKPIs {
  totalClientes: number;
  totalCompras: number;
  totalReservas: number;
}

export interface DashboardChartData {
  ingresosTotalesNetos: number;
  ingresosTotalesBrutos: number;
  comprasPorPlan: {
    plan: string;
    total: number;
    ingresosNetos: number;
    ingresosBrutos: number;
  }[];
  comprasPorMes: {
    mes: string;
    total: number;
    ingresosNetos: number;
    ingresosBrutos: number;
  }[];
  comprasRecientes: ComprasRecientesRow[];
}

/** @deprecated Usar getDashboardKPIs() + getDashboardChartData() por separado */
export interface DashboardStats extends DashboardKPIs, DashboardChartData {}

// ============================================================
// Funciones de consulta
// ============================================================

/**
 * KPIs rápidos: 3 conteos con head:true (no descarga filas).
 * Resuelve antes que getDashboardChartData, permitiendo streaming paralelo.
 */
export const getDashboardKPIs = cache(async (): Promise<DashboardKPIs> => {
  const supabase = createAdminClient();

  const [
    { count: totalClientes },
    { count: totalCompras },
    { count: totalReservas },
  ] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("purchases").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
  ]);

  return {
    totalClientes: totalClientes ?? 0,
    totalCompras: totalCompras ?? 0,
    totalReservas: totalReservas ?? 0,
  };
});

/**
 * Datos para gráficas y tabla de compras recientes.
 * Más lento que getDashboardKPIs porque agrega filas de los últimos 6 meses.
 */
export const getDashboardChartData = cache(
  async (): Promise<DashboardChartData> => {
    const supabase = createAdminClient();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoISO = sixMonthsAgo.toISOString();

    const [{ data: completedForStats }, { data: comprasRecientesRaw }] =
      await Promise.all([
        // Solo compras completadas en los últimos 6 meses, solo columnas necesarias
        supabase
          .from("purchases")
          .select("plan_type, amount, gross_amount_usd, net_amount_usd, created_at")
          .eq("status", "completed")
          .gte("created_at", sixMonthsAgoISO),
        // Últimas 5 compras — solo columnas que la tabla renderiza (P4)
        supabase
          .from("purchases")
          .select("id, status, plan_type, amount, gross_amount_usd, paypal_fee_usd, net_amount_usd, created_at, customers(name, email)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    const purchases = (completedForStats ?? []) as Pick<
      DbPurchase,
      "plan_type" | "amount" | "gross_amount_usd" | "net_amount_usd" | "created_at"
    >[];

    // Un solo loop — combina ingresos netos/brutos + compras por plan y mes (P6)
    let ingresosTotalesNetos = 0;
    let ingresosTotalesBrutos = 0;
    const planMap = new Map<string, { total: number; ingresosNetos: number; ingresosBrutos: number }>();
    const comprasPorMesMap = new Map<string, { total: number; ingresosNetos: number; ingresosBrutos: number }>();

    for (const p of purchases) {
      const grossAmount = getGrossAmountUSD(p);
      const netAmount = getNetAmountUSD(p);

      // Ingresos totales
      ingresosTotalesBrutos += grossAmount;
      ingresosTotalesNetos += netAmount;

      // Por plan
      const planEntry = planMap.get(p.plan_type) ?? {
        total: 0,
        ingresosNetos: 0,
        ingresosBrutos: 0,
      };
      planEntry.total += 1;
      planEntry.ingresosNetos += netAmount;
      planEntry.ingresosBrutos += grossAmount;
      planMap.set(p.plan_type, planEntry);

      // Por mes
      const date = new Date(p.created_at);
      const mesKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const mesEntry = comprasPorMesMap.get(mesKey) ?? {
        total: 0,
        ingresosNetos: 0,
        ingresosBrutos: 0,
      };
      mesEntry.total += 1;
      mesEntry.ingresosNetos += netAmount;
      mesEntry.ingresosBrutos += grossAmount;
      comprasPorMesMap.set(mesKey, mesEntry);
    }

    const comprasPorPlan = Array.from(planMap.entries()).map(
      ([plan, data]) => ({ plan, ...data }),
    );

    const comprasPorMes = Array.from(comprasPorMesMap.entries())
      .map(([mes, data]) => ({ mes, ...data }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    return {
      ingresosTotalesNetos,
      ingresosTotalesBrutos,
      comprasPorPlan,
      comprasPorMes,
      comprasRecientes: (comprasRecientesRaw ?? []) as ComprasRecientesRow[],
    };
  },
);

/** Obtiene clientes paginados con búsqueda por nombre o email.
 *  @param page  Número de página (1-based)
 *  @param search Término de búsqueda (filtra por nombre o email)
 */
export const getCustomers = cache(
  async (
    page: number = 1,
    search: string = "",
  ): Promise<PaginatedResult<CustomerWithPurchaseCount>> => {
    const supabase = createAdminClient();
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Construir la query base con conteo de compras (sin descargar los objetos)
    let query = supabase
      .from("customers")
      .select("*, purchases(count)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Aplicar filtro de búsqueda si hay término
    if (search.trim()) {
      query = query.or(
        `email.ilike.%${search.trim()}%,name.ilike.%${search.trim()}%`,
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error al obtener clientes:", error);
      return { data: [], total: 0, page, totalPages: 0 };
    }

    // Supabase devuelve purchases como [{ count: N }] — normalizar a número
    const customers: CustomerWithPurchaseCount[] = (data ?? []).map((c) => {
      const raw = c as unknown as DbCustomer & { purchases: { count: number }[] };
      return {
        ...raw,
        purchase_count: raw.purchases?.[0]?.count ?? 0,
      };
    });

    const total = count ?? 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    return { data: customers, total, page, totalPages };
  },
);

/** Obtiene compras paginadas con búsqueda por nombre o email del cliente.
 *  Usa RPC search_purchases porque el SDK de Supabase-js no soporta .or()
 *  sobre tablas relacionadas con !inner join.
 *  @param page   Número de página (1-based)
 *  @param search Término de búsqueda (filtra por nombre o email del cliente)
 */
export const getPurchases = cache(
  async (
    page: number = 1,
    search: string = "",
  ): Promise<PaginatedResult<PurchaseWithCustomer>> => {
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("search_purchases", {
      p_search: search.trim(),
      p_page: page,
      p_limit: PAGE_SIZE,
    });

    if (error) {
      console.error("Error al obtener compras:", error);
      return { data: [], total: 0, page, totalPages: 0 };
    }

    const rows = data ?? [];
    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Normalizar la respuesta plana de la RPC al shape PurchaseWithCustomer
    const purchases: PurchaseWithCustomer[] = rows.map((r) => ({
      id: r.id,
      customer_id: r.customer_id,
      paypal_order_id: r.paypal_order_id,
      paypal_capture_id: r.paypal_capture_id,
      plan_type: r.plan_type,
      gross_amount_usd: r.gross_amount_usd,
      paypal_fee_usd: r.paypal_fee_usd,
      net_amount_usd: r.net_amount_usd,
      amount: r.amount,
      currency: r.currency,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      customers: r.customer_email
        ? { name: r.customer_name, email: r.customer_email }
        : null,
    }));

    return { data: purchases, total, page, totalPages };
  },
);

/** Obtiene reservas paginadas con búsqueda por nombre o email del cliente.
 *  Usa RPC search_bookings por la misma razón que getPurchases: el SDK de
 *  Supabase-js no soporta .or() sobre relaciones anidadas (bookings->purchases->customers).
 *  @param page   Número de página (1-based)
 *  @param search Término de búsqueda (filtra por nombre o email del cliente)
 */
export const getBookings = cache(
  async (
    page: number = 1,
    search: string = "",
  ): Promise<PaginatedResult<BookingWithPurchase>> => {
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("search_bookings", {
      p_search: search.trim(),
      p_page: page,
      p_limit: PAGE_SIZE,
    });

    if (error) {
      console.error("Error al obtener reservas:", error);
      return { data: [], total: 0, page, totalPages: 0 };
    }

    const rows = data ?? [];
    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Normalizar la respuesta plana de la RPC al shape BookingWithPurchase
    const bookings: BookingWithPurchase[] = rows.map((r) => ({
      id: r.id,
      purchase_id: r.purchase_id,
      cal_booking_id: r.cal_booking_id,
      scheduled_date: r.scheduled_date,
      status: r.status,
      rustdesk_id: r.rustdesk_id,
      notes: r.notes,
      created_at: r.created_at,
      updated_at: r.updated_at,
      purchases:
        r.purchase_plan_type != null && r.purchase_amount != null
          ? {
              plan_type: r.purchase_plan_type,
              amount: r.purchase_amount,
              customers: r.customer_email
                ? { name: r.customer_name, email: r.customer_email }
                : null,
            }
          : null,
    }));

    return { data: bookings, total, page, totalPages };
  },
);

/**
 * Detalles completos de un cliente: sus datos, compras y reservas.
 * Llama a la RPC get_customer_details que ejecuta todo en una sola query SQL,
 * evitando múltiples roundtrips a Postgres (regla async-parallel).
 * React.cache() deduplica llamadas idénticas en el mismo ciclo de render
 * (regla server-cache-react).
 */
export const getCustomerDetails = cache(
  async (customerId: string): Promise<CustomerDetails | null> => {
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("get_customer_details", {
      p_customer_id: customerId,
    });

    if (error) {
      console.error("Error al obtener detalles del cliente:", error);
      return null;
    }

    if (!data) return null;

    // La RPC retorna JSON — casteamos con los tipos correctos
    const result = data as unknown as CustomerDetails;
    return result;
  },
);
