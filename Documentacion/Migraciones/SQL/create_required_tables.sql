-- Create tables for the reporting system

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  unit_price NUMERIC NOT NULL,
  cost_price NUMERIC,
  sku TEXT UNIQUE,
  barcode TEXT,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  supplier_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  total_amount NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  final_amount NUMERIC NOT NULL,
  payment_method TEXT,
  customer_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'cashier',
  store_id UUID REFERENCES stores(id),
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_batches table
CREATE TABLE IF NOT EXISTS inventory_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  store_id UUID REFERENCES stores(id),
  batch_number TEXT,
  quantity INTEGER NOT NULL,
  expiration_date DATE,
  cost_per_unit NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample data for testing
INSERT INTO stores (id, name, address) VALUES 
  (gen_random_uuid(), 'Almacén Central', 'Calle Principal 123'),
  (gen_random_uuid(), 'Tienda 1', 'Avenida Secundaria 456'),
  (gen_random_uuid(), 'Tienda 2', 'Carrera Terciaria 789')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, description) VALUES 
  (gen_random_uuid(), 'Lácteos', 'Productos lácteos frescos'),
  (gen_random_uuid(), 'Verduras', 'Verduras y hortalizas frescas'),
  (gen_random_uuid(), 'Carnes', 'Todo tipo de carnes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, category_id, unit_price, cost_price, sku, stock_quantity) VALUES 
  (gen_random_uuid(), 'Leche Entera 1L', (SELECT id FROM categories WHERE name = 'Lácteos' LIMIT 1), 15.00, 12.00, 'LCH001', 100),
  (gen_random_uuid(), 'Queso Fresco 500g', (SELECT id FROM categories WHERE name = 'Lácteos' LIMIT 1), 25.00, 20.00, 'QSF001', 50),
  (gen_random_uuid(), 'Tomate 1Kg', (SELECT id FROM categories WHERE name = 'Verduras' LIMIT 1), 12.00, 8.00, 'TMT001', 200),
  (gen_random_uuid(), 'Cebolla 1Kg', (SELECT id FROM categories WHERE name = 'Verduras' LIMIT 1), 8.00, 5.00, 'CBN001', 150),
  (gen_random_uuid(), 'Pollo Entero 1Kg', (SELECT id FROM categories WHERE name = 'Carnes' LIMIT 1), 45.00, 35.00, 'PLO001', 30)
ON CONFLICT (id) DO NOTHING;

-- Create a table to track report requests for logging purposes
CREATE TABLE IF NOT EXISTS report_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID,
  report_name TEXT NOT NULL,
  params JSONB,
  format TEXT DEFAULT 'json',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);