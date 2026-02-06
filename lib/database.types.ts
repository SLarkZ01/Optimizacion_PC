// Definiciones de tipos de base de datos que reflejan el esquema de Supabase
// Estos tipos son un espejo de las tablas definidas en supabase/schema.sql

export type PlanType = "basic" | "gamer" | "premium";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type BookingStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface DbCustomer {
  id: string;
  email: string;
  phone: string | null;
  name: string | null;
  created_at: string;
}

export interface DbPurchase {
  id: string;
  customer_id: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  plan_type: PlanType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface DbBooking {
  id: string;
  purchase_id: string;
  cal_booking_id: string | null;
  scheduled_date: string | null;
  status: BookingStatus;
  rustdesk_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Definición de tipo Database de Supabase para consultas con tipado seguro
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: DbCustomer;
        Insert: Omit<DbCustomer, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbCustomer, "id">>;
      };
      purchases: {
        Row: DbPurchase;
        Insert: Omit<DbPurchase, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbPurchase, "id">>;
      };
      bookings: {
        Row: DbBooking;
        Insert: Omit<DbBooking, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbBooking, "id">>;
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
}
