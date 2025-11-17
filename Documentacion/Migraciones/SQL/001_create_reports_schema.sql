-- Migration to create reports schema and top_products function

-- Crear el esquema para funciones de reportes si no existe
CREATE SCHEMA IF NOT EXISTS reports;

-- Crear la función que devuelve los productos más vendidos en un periodo
CREATE OR REPLACE FUNCTION reports.top_products(
    p_from timestamptz, 
    p_to timestamptz, 
    p_store_id text DEFAULT NULL, 
    p_limit int DEFAULT 3
)
RETURNS TABLE(
    product_id uuid, 
    name text, 
    units_sold numeric, 
    revenue numeric
)
LANGUAGE sql
AS $$
  SELECT
    p.id AS product_id,
    p.name,
    SUM((item->>'quantity')::numeric) AS units_sold,
    SUM(((item->>'quantity')::numeric) * COALESCE((item->>'price')::numeric, 0)) AS revenue
  FROM public.sales s,
  LATERAL jsonb_array_elements(s.cart) AS item
  JOIN public.products p ON (item->>'product_id')::uuid = p.id
  WHERE s.date BETWEEN p_from AND p_to
    AND (p_store_id IS NULL OR s.store_id = p_store_id)
  GROUP BY p.id, p.name
  ORDER BY units_sold DESC
  LIMIT p_limit;
$$;

-- Crear función para reporte de ventas por categoría
CREATE OR REPLACE FUNCTION reports.sales_by_category(
    p_from timestamptz, 
    p_to timestamptz, 
    p_store_id text DEFAULT NULL
)
RETURNS TABLE(
    category_name text, 
    units_sold numeric, 
    revenue numeric
)
LANGUAGE sql
AS $$
  SELECT
    c.name AS category_name,
    SUM((item->>'quantity')::numeric) AS units_sold,
    SUM(((item->>'quantity')::numeric) * COALESCE((item->>'price')::numeric, 0)) AS revenue
  FROM public.sales s,
  LATERAL jsonb_array_elements(s.cart) AS item
  JOIN public.products p ON (item->>'product_id')::uuid = p.id
  JOIN public.categories c ON p.category_id = c.id
  WHERE s.date BETWEEN p_from AND p_to
    AND (p_store_id IS NULL OR s.store_id = p_store_id)
  GROUP BY c.id, c.name
  ORDER BY revenue DESC;
$$;

-- Crear función para reporte de ventas totales por periodo
CREATE OR REPLACE FUNCTION reports.sales_summary(
    p_from timestamptz, 
    p_to timestamptz, 
    p_store_id text DEFAULT NULL
)
RETURNS TABLE(
    total_sales numeric, 
    total_transactions int, 
    avg_transaction_value numeric
)
LANGUAGE sql
AS $$
  SELECT
    COALESCE(SUM(s.total), 0) AS total_sales,
    COUNT(*) AS total_transactions,
    COALESCE(AVG(s.total), 0) AS avg_transaction_value
  FROM public.sales s
  WHERE s.date BETWEEN p_from AND p_to
    AND (p_store_id IS NULL OR s.store_id = p_store_id);
$$;

-- Crear tabla para auditoría de solicitudes de reportes
CREATE TABLE IF NOT EXISTS public.report_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by uuid,
  report_name text NOT NULL,
  params jsonb,
  format text,
  created_at timestamptz DEFAULT now()
);