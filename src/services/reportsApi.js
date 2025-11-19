import { supabase } from '../config/supabase';

async function _requestReport(reportType, params = {}) {
  const jwt = await getAuthToken();

  if (!jwt) {
    throw new Error('No hay sesión activa. Por favor, inicie sesión para acceder a los reportes.');
  }

  // Default to last week if no period specified
  if (!params.period && !params.from && !params.to) {
    params.period = 'last_week';
  }

  const reportingUrl = import.meta.env.VITE_SUPABASE_URL.replace('supabase.co', 'functions.supabase.co');
  const response = await fetch(`${reportingUrl}/reporting`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      reportType,
      ...params,
      p_from: params.from || null,
      p_to: params.to || null,
      p_store_id: params.store_id || null,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('No autorizado. Verifique su sesión e intente nuevamente.');
    } else if (response.status === 403) {
      throw new Error('Acceso denegado. Se requiere rol de administrador para acceder a los reportes.');
    } else {
      throw new Error(`Error fetching report: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
}

/**
 * Request the top selling products report
 * @param {Object} params - Report parameters
 * @param {string} params.period - Time period (e.g., 'last_week') or use from/to
 * @param {string} params.from - Start date (YYYY-MM-DD)
 * @param {string} params.to - End date (YYYY-MM-DD)
 * @param {number} params.limit - Number of products to return (default: 3)
 * @param {string} params.store_id - Optional store ID to filter by
 * @returns {Promise<Object>} - Report data
 */
export async function requestTopProducts(params = {}) {
  return _requestReport('top_products', { ...params, p_limit: params.limit || 3 });
}

/**
 * Request sales by category report
 * @param {Object} params - Report parameters
 * @param {string} params.period - Time period (e.g., 'last_week') or use from/to
 * @param {string} params.from - Start date (YYYY-MM-DD)
 * @param {string} params.to - End date (YYYY-MM-DD)
 * @param {string} params.store_id - Optional store ID to filter by
 * @returns {Promise<Object>} - Report data
 */
export async function requestSalesByCategory(params = {}) {
  return _requestReport('sales_by_category', params);
}

/**
 * Request sales summary report
 * @param {Object} params - Report parameters
 * @param {string} params.period - Time period (e.g., 'last_week') or use from/to
 * @param {string} params.from - Start date (YYYY-MM-DD)
 * @param {string} params.to - End date (YYYY-MM-DD)
 * @param {string} params.store_id - Optional store ID to filter by
 * @returns {Promise<Object>} - Report data
 */
export async function requestSalesSummary(params = {}) {
  return _requestReport('sales_summary', params);
}


/**
 * Get the available reports schema
 * @returns {Promise<Object>} - Schema information
 */
export async function getReportsSchema() {
  // The actual reporting function doesn't support GET requests for schema
  // Return a static schema for the chat interface to use
  return {
    reports: [
      {
        name: "top_products",
        description: "Productos más vendidos en un periodo",
        params: {
          period: ["last_week", "from/to"],
          limit: "integer (max 100)",
          store_id: "string|null",
          format: ["json"],
        },
      },
      {
        name: "sales_by_category",
        description: "Ventas por categoría en un periodo",
        params: {
          period: ["last_week", "from/to"],
          store_id: "string|null",
          format: ["json"],
        },
      },
      {
        name: "sales_summary",
        description: "Resumen de ventas en un periodo",
        params: {
          period: ["last_week", "from/to"],
          store_id: "string|null",
          format: ["json"],
        },
      },
    ],
  };
}

/**
 * Check the reporting API status
 * @returns {Promise<Object>} - Status information
 */
export async function getReportStatus() {
  // The actual reporting function doesn't support GET requests for status
  // Return a static status for the chat interface to use
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    available_reports: ["top_products", "sales_by_category", "sales_summary"],
  };
}

/**
 * Helper function to get auth token
 * @private
 */
async function getAuthToken() {
  const token = await supabase.auth.getSession();
  return token?.data?.session?.access_token;
}