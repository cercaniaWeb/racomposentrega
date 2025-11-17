-- Script para crear funciones de reporting en Supabase
-- Copia y pega este contenido en el SQL Editor de Supabase

-- Crear el esquema si no existe
CREATE SCHEMA IF NOT EXISTS reports;

-- Función para productos más vendidos
CREATE OR REPLACE FUNCTION reports.top_products(
  p_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_store_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
  product_id UUID,
  name TEXT,
  units_sold BIGINT,
  revenue NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Esta es una implementación de ejemplo que puedes ajustar según tu esquema
  -- Ajusta las tablas y columnas según tu modelo de datos real
  RETURN QUERY
  SELECT 
    p.id::UUID as product_id,
    p.name::TEXT,
    COALESCE(SUM(si.quantity), 0)::BIGINT as units_sold,
    COALESCE(SUM(si.quantity * si.unit_price), 0)::NUMERIC as revenue
  FROM products p
  LEFT JOIN sale_items si ON p.id = si.product_id
  LEFT JOIN sales s ON si.sale_id = s.id
  WHERE 
    (p_from IS NULL OR s.created_at >= p_from)
    AND (p_to IS NULL OR s.created_at <= p_to)
    AND (p_store_id IS NULL OR s.store_id = p_store_id)
  GROUP BY p.id, p.name
  ORDER BY units_sold DESC NULLS LAST
  LIMIT p_limit;
END;
$$;

-- Función para ventas por categoría
CREATE OR REPLACE FUNCTION reports.sales_by_category(
  p_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_store_id UUID DEFAULT NULL
)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  units_sold BIGINT,
  revenue NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Esta es una implementación de ejemplo que puedes ajustar según tu esquema
  RETURN QUERY
  SELECT 
    c.id::UUID as category_id,
    c.name::TEXT as category_name,
    COALESCE(SUM(si.quantity), 0)::BIGINT as units_sold,
    COALESCE(SUM(si.quantity * si.unit_price), 0)::NUMERIC as revenue
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id
  LEFT JOIN sale_items si ON p.id = si.product_id
  LEFT JOIN sales s ON si.sale_id = s.id
  WHERE 
    (p_from IS NULL OR s.created_at >= p_from)
    AND (p_to IS NULL OR s.created_at <= p_to)
    AND (p_store_id IS NULL OR s.store_id = p_store_id)
  GROUP BY c.id, c.name
  ORDER BY revenue DESC NULLS LAST;
END;
$$;

-- Función para resumen de ventas
CREATE OR REPLACE FUNCTION reports.sales_summary(
  p_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_store_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_sales NUMERIC,
  total_transactions BIGINT,
  avg_transaction_value NUMERIC,
  top_product_name TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  top_product TEXT := '';
BEGIN
  -- Obtener el nombre del producto más vendido
  SELECT COALESCE(p.name, '') INTO top_product
  FROM products p
  LEFT JOIN sale_items si ON p.id = si.product_id
  LEFT JOIN sales s ON si.sale_id = s.id
  WHERE 
    (p_from IS NULL OR s.created_at >= p_from)
    AND (p_to IS NULL OR s.created_at <= p_to)
    AND (p_store_id IS NULL OR s.store_id = p_store_id)
  GROUP BY p.id, p.name
  ORDER BY SUM(si.quantity) DESC NULLS LAST
  LIMIT 1;

  RETURN QUERY
  SELECT 
    COALESCE(SUM(si.quantity * si.unit_price), 0)::NUMERIC as total_sales,
    COALESCE(COUNT(DISTINCT s.id), 0)::BIGINT as total_transactions,
    CASE 
      WHEN COUNT(DISTINCT s.id) > 0 
      THEN COALESCE(SUM(si.quantity * si.unit_price) / COUNT(DISTINCT s.id), 0)
      ELSE 0 
    END::NUMERIC as avg_transaction_value,
    top_product::TEXT as top_product_name
  FROM sales s
  LEFT JOIN sale_items si ON s.id = si.sale_id
  WHERE 
    (p_from IS NULL OR s.created_at >= p_from)
    AND (p_to IS NULL OR s.created_at <= p_to)
    AND (p_store_id IS NULL OR s.store_id = p_store_id);
END;
$$;

-- Otorgar permisos a los roles necesarios
GRANT EXECUTE ON FUNCTION reports.top_products(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION reports.top_products(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID, INTEGER) TO anon;

GRANT EXECUTE ON FUNCTION reports.sales_by_category(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION reports.sales_by_category(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID) TO anon;

GRANT EXECUTE ON FUNCTION reports.sales_summary(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION reports.sales_summary(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID) TO anon;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Funciones de reporting creadas exitosamente en el esquema reports';
END $$;