-- ===========================================
-- PCOptimize - Esquema de Base de Datos
-- ===========================================
-- Referencia del estado actual de la DB en Supabase.
-- Para aplicar desde cero, ejecutar en orden en el Editor SQL de Supabase.
-- Ultima actualizacion: Marzo 2026 (limpieza de grants, indices y funciones)

-- Habilitar extension UUID (generalmente ya esta habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Tipos ENUM personalizados
-- ===========================================

CREATE TYPE plan_type AS ENUM ('basic', 'gamer', 'premium');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE booking_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- ===========================================
-- Tabla: customers
-- ===========================================
-- Almacena informacion de clientes recopilada durante el checkout

CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE customers IS 'Registros de clientes creados durante el checkout de PayPal';
COMMENT ON COLUMN customers.phone IS 'Numero de WhatsApp/telefono para contacto';

-- ===========================================
-- Tabla: purchases
-- ===========================================
-- Almacena registros de pagos capturados desde PayPal Orders API

CREATE TABLE purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  paypal_order_id TEXT UNIQUE NOT NULL,
  paypal_capture_id TEXT UNIQUE,
  plan_type plan_type NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),  -- Monto en USD (ej: 19.00 = $19 USD)
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),  -- ISO 4217 en mayusculas (USD)
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE purchases IS 'Registros de pagos capturados desde PayPal Orders API';
COMMENT ON COLUMN purchases.paypal_order_id IS 'ID de orden de PayPal (ej: 5O190127TN364715T)';
COMMENT ON COLUMN purchases.paypal_capture_id IS 'ID de captura de PayPal tras completar el pago';
COMMENT ON COLUMN purchases.amount IS 'Monto en USD (ej: 19.00 = $19 USD)';
COMMENT ON COLUMN purchases.currency IS 'ISO 4217 en mayusculas (USD). Siempre se cobra en USD';

-- ===========================================
-- Tabla: bookings
-- ===========================================
-- Almacena registros de agendamiento/reservas de Cal.com

CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  cal_booking_id TEXT UNIQUE,
  scheduled_date TIMESTAMPTZ,
  status booking_status NOT NULL DEFAULT 'scheduled',
  rustdesk_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE bookings IS 'Registros de agendamiento de servicio desde Cal.com';
COMMENT ON COLUMN bookings.rustdesk_id IS 'ID de acceso remoto RustDesk proporcionado por el cliente';
COMMENT ON COLUMN bookings.notes IS 'Notas internas sobre la reserva/servicio';

-- ===========================================
-- Indices para rendimiento
-- ===========================================

-- Indices de FK (necesarios para JOINs eficientes)
CREATE INDEX idx_purchases_customer_id ON purchases(customer_id);
CREATE INDEX idx_bookings_purchase_id ON bookings(purchase_id);

-- Indices parciales: solo indexan filas activas (mas pequeños y rapidos)
-- Reemplazan full indexes en columnas status
CREATE INDEX idx_purchases_pending ON purchases(created_at DESC) WHERE status = 'pending';
CREATE INDEX idx_bookings_scheduled ON bookings(scheduled_date) WHERE status = 'scheduled';

-- Indice en purchases.created_at para consultas admin (ordenar por fecha)
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);

-- NOTA: idx_customers_email e idx_purchases_paypal_order NO se crean porque
-- ya estan cubiertos por los UNIQUE constraints (customers_email_key y
-- purchases_paypal_order_id_key) que generan indices implicitos.
-- NOTA: idx_bookings_scheduled_date (full index) fue eliminado en Marzo 2026
-- porque idx_bookings_scheduled (partial index) lo cubre de forma mas eficiente.

-- Indice en customers.name para busqueda de texto en el dashboard admin
-- (.ilike() sobre name sin este indice haria seq scan en tabla completa)
CREATE INDEX idx_customers_name ON customers(name);

-- ===========================================
-- Funcion trigger para updated_at
-- ===========================================
-- search_path fijo previene search_path hijacking (lint: 0011_function_search_path_mutable)
-- SECURITY INVOKER: la funcion corre con privilegios del llamador (mas seguro)

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar a purchases
CREATE TRIGGER set_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Aplicar a bookings
CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ===========================================
-- Seguridad a Nivel de Fila (RLS)
-- ===========================================
-- RLS habilitado en todas las tablas.
-- Todo acceso pasa por API routes del servidor con la clave service_role.
-- No hay acceso directo desde el cliente (browser).

-- Revocar privilegio de creacion en schema public al rol public
-- Evita que usuarios no autorizados creen objetos en el schema (security-privileges.md)
REVOKE CREATE ON SCHEMA public FROM public;

-- Revocar todos los privilegios de anon y authenticated sobre las tablas.
-- El acceso de escritura/lectura se gestiona via service_role en API routes.
-- Esto sigue el principio de minimo privilegio: denegar por defecto a nivel
-- de GRANT, luego abrir solo lo estrictamente necesario via politicas RLS.
REVOKE ALL ON public.customers FROM anon, authenticated;
REVOKE ALL ON public.purchases FROM anon, authenticated;
REVOKE ALL ON public.bookings  FROM anon, authenticated;

-- Restaurar solo SELECT para authenticated (necesario para el dashboard admin
-- que usa Supabase Auth con rol authenticated + politicas RLS de lectura).
GRANT SELECT ON public.customers TO authenticated;
GRANT SELECT ON public.purchases TO authenticated;
GRANT SELECT ON public.bookings  TO authenticated;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Politicas por operacion con rol service_role explicito
-- (evita advertencias del advisor de seguridad de Supabase)

-- customers
CREATE POLICY "service_role puede leer customers"
  ON customers FOR SELECT TO service_role USING (true);
CREATE POLICY "service_role puede insertar customers"
  ON customers FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "service_role puede actualizar customers"
  ON customers FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role puede eliminar customers"
  ON customers FOR DELETE TO service_role USING (true);

-- purchases
CREATE POLICY "service_role puede leer purchases"
  ON purchases FOR SELECT TO service_role USING (true);
CREATE POLICY "service_role puede insertar purchases"
  ON purchases FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "service_role puede actualizar purchases"
  ON purchases FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role puede eliminar purchases"
  ON purchases FOR DELETE TO service_role USING (true);

-- bookings
CREATE POLICY "service_role puede leer bookings"
  ON bookings FOR SELECT TO service_role USING (true);
CREATE POLICY "service_role puede insertar bookings"
  ON bookings FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "service_role puede actualizar bookings"
  ON bookings FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role puede eliminar bookings"
  ON bookings FOR DELETE TO service_role USING (true);

-- Politicas de lectura para el dashboard admin (rol authenticated via Supabase Auth)
CREATE POLICY "authenticated_read_customers"
  ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_purchases"
  ON purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_bookings"
  ON bookings FOR SELECT TO authenticated USING (true);

-- ===========================================
-- RPCs de búsqueda paginada para el dashboard
-- ===========================================
-- Se usan RPCs porque el SDK de Supabase-js no soporta .or() sobre
-- tablas relacionadas con !inner join (filtrar en columnas de la tabla
-- relacionada en el cliente genera un error de PostgREST).
-- SECURITY INVOKER + search_path fijo (best practices).
-- COUNT(*) OVER() devuelve el total en la misma query, evitando
-- un segundo viaje a la DB solo para contar.

CREATE OR REPLACE FUNCTION public.search_purchases(
  p_search TEXT DEFAULT '',
  p_page   INT  DEFAULT 1,
  p_limit  INT  DEFAULT 10
)
RETURNS TABLE (
  id               UUID,
  customer_id      UUID,
  paypal_order_id  TEXT,
  paypal_capture_id TEXT,
  plan_type        public.plan_type,
  amount           NUMERIC,
  currency         TEXT,
  status           public.payment_status,
  created_at       TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ,
  customer_name    TEXT,
  customer_email   TEXT,
  total_count      BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = ''
AS $$
DECLARE
  v_offset INT := (p_page - 1) * p_limit;
  v_search TEXT := TRIM(p_search);
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.customer_id,
    p.paypal_order_id,
    p.paypal_capture_id,
    p.plan_type,
    p.amount,
    p.currency,
    p.status,
    p.created_at,
    p.updated_at,
    c.name    AS customer_name,
    c.email   AS customer_email,
    COUNT(*) OVER() AS total_count
  FROM public.purchases p
  INNER JOIN public.customers c ON c.id = p.customer_id
  WHERE
    v_search = ''
    OR c.email ILIKE '%' || v_search || '%'
    OR c.name  ILIKE '%' || v_search || '%'
  ORDER BY p.created_at DESC
  LIMIT  p_limit
  OFFSET v_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_bookings(
  p_search TEXT DEFAULT '',
  p_page   INT  DEFAULT 1,
  p_limit  INT  DEFAULT 10
)
RETURNS TABLE (
  id               UUID,
  purchase_id      UUID,
  cal_booking_id   TEXT,
  scheduled_date   TIMESTAMPTZ,
  status           public.booking_status,
  rustdesk_id      TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ,
  purchase_plan_type  public.plan_type,
  purchase_amount     NUMERIC,
  customer_name    TEXT,
  customer_email   TEXT,
  total_count      BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = ''
AS $$
DECLARE
  v_offset INT := (p_page - 1) * p_limit;
  v_search TEXT := TRIM(p_search);
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.purchase_id,
    b.cal_booking_id,
    b.scheduled_date,
    b.status,
    b.rustdesk_id,
    b.notes,
    b.created_at,
    b.updated_at,
    p.plan_type  AS purchase_plan_type,
    p.amount     AS purchase_amount,
    c.name       AS customer_name,
    c.email      AS customer_email,
    COUNT(*) OVER() AS total_count
  FROM public.bookings b
  LEFT JOIN public.purchases p ON p.id = b.purchase_id
  LEFT JOIN public.customers c ON c.id = p.customer_id
  WHERE
    v_search = ''
    OR c.email ILIKE '%' || v_search || '%'
    OR c.name  ILIKE '%' || v_search || '%'
    OR b.cal_booking_id ILIKE '%' || v_search || '%'
  ORDER BY b.created_at DESC
  LIMIT  p_limit
  OFFSET v_offset;
END;
$$;

-- Permisos de ejecución de las RPCs
GRANT EXECUTE ON FUNCTION public.search_purchases(TEXT, INT, INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_bookings(TEXT, INT, INT)  TO authenticated, service_role;

-- ===========================================
-- Notas de seguridad adicionales
-- ===========================================
-- Leaked Password Protection: habilitar manualmente en el dashboard de Supabase
-- en Authentication > Settings > Password Security.
-- Esto verifica las contraseñas contra HaveIBeenPwned.org al autenticar.
