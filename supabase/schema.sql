-- ===========================================
-- PCOptimize - Esquema de Base de Datos
-- ===========================================
-- Ejecutar esto en el Editor SQL de Supabase para crear todas las tablas
-- Última actualización: Febrero 2026

-- Habilitar extensión UUID (generalmente ya está habilitada)
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
-- Almacena información de clientes recopilada durante el checkout

CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE customers IS 'Registros de clientes creados durante el checkout de Stripe';
COMMENT ON COLUMN customers.phone IS 'Número de WhatsApp/teléfono para contacto';

-- ===========================================
-- Tabla: purchases
-- ===========================================
-- Almacena registros de pagos/compras de Stripe

CREATE TABLE purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  plan_type plan_type NOT NULL,
  amount INTEGER NOT NULL,              -- Monto en la unidad más pequeña de la moneda (centavos)
  currency TEXT NOT NULL DEFAULT 'usd',  -- Código de moneda ISO 4217
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE purchases IS 'Registros de pagos de sesiones de checkout de Stripe';
COMMENT ON COLUMN purchases.amount IS 'Monto en centavos (ej: 1500 = $15.00 USD)';
COMMENT ON COLUMN purchases.currency IS 'ISO 4217 en minúsculas (usd, cop, eur, etc.)';

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
-- Índices para rendimiento
-- ===========================================

CREATE INDEX idx_purchases_customer_id ON purchases(customer_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_stripe_session ON purchases(stripe_session_id);
CREATE INDEX idx_bookings_purchase_id ON bookings(purchase_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_customers_email ON customers(email);

-- ===========================================
-- Función trigger para updated_at
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a purchases
CREATE TRIGGER set_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar a bookings
CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Seguridad a Nivel de Fila (RLS)
-- ===========================================
-- Habilitar RLS en todas las tablas. El acceso se controla mediante
-- la clave service_role desde el servidor (API routes, webhooks).
-- No se necesita acceso directo del cliente.

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- El rol de servicio omite RLS automáticamente.
-- Si necesitamos acceso anónimo en el futuro (ej: autoservicio del cliente),
-- agregar políticas aquí. Por ahora, todas las operaciones de BD pasan
-- por API routes del servidor usando la clave service_role.

-- Política: Permitir acceso completo al rol de servicio (este es el
-- comportamiento por defecto, pero se deja explícito para documentación)
CREATE POLICY "Rol de servicio tiene acceso completo a customers"
  ON customers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Rol de servicio tiene acceso completo a purchases"
  ON purchases FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Rol de servicio tiene acceso completo a bookings"
  ON bookings FOR ALL
  USING (true)
  WITH CHECK (true);
