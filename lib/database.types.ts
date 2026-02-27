// Definiciones de tipos de base de datos que reflejan el esquema de Supabase
// Estos tipos son un espejo de las tablas definidas en supabase/schema.sql
// Formato compatible con @supabase/supabase-js v2.95+
//
// IMPORTANTE: Los tipos de fila (Row/Insert/Update) deben ser `type`, no `interface`.
// Las interfaces de TypeScript no tienen index signature implícito, lo que causa
// que GenericTable (Record<string, unknown>) no sea compatible y el schema
// se resuelva a `never`. Esto es una limitación conocida de TypeScript.

export type PlanType = "basic" | "gamer" | "premium";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type BookingStatus = "scheduled" | "completed" | "cancelled" | "no_show";

// Tipos de fila — usar `type` (no `interface`) para compatibilidad con Record<string, unknown>
export type DbCustomer = {
  id: string;
  email: string;
  phone: string | null;
  name: string | null;
  created_at: string;
};

export type DbPurchase = {
  id: string;
  customer_id: string;
  paypal_order_id: string;
  paypal_capture_id: string | null;
  plan_type: PlanType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

export type DbBooking = {
  id: string;
  purchase_id: string;
  cal_booking_id: string | null;
  scheduled_date: string | null;
  status: BookingStatus;
  rustdesk_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// Definición de tipo Database de Supabase para consultas con tipado seguro
// Cada tabla incluye Relationships (requerido por supabase-js v2.95+)
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: DbCustomer;
        Insert: Omit<DbCustomer, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbCustomer, "id">>;
        Relationships: [];
      };
      purchases: {
        Row: DbPurchase;
        Insert: Omit<DbPurchase, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbPurchase, "id">>;
        Relationships: [
          {
            foreignKeyName: "purchases_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: DbBooking;
        Insert: Omit<DbBooking, "id" | "created_at" | "updated_at" | "rustdesk_id" | "notes"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          rustdesk_id?: string | null;
          notes?: string | null;
        };
        Update: Partial<Omit<DbBooking, "id">>;
        Relationships: [
          {
            foreignKeyName: "bookings_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      plan_type: PlanType;
      payment_status: PaymentStatus;
      booking_status: BookingStatus;
    };
  };
};
