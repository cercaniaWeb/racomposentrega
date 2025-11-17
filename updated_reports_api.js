import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const token = await supabase.auth.getSession();
  const jwt = token?.data?.session?.access_token;

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
    },
    body: JSON.stringify({
      report: 'top_products',
      params: {
        ...params,
        limit: params.limit || 3
      }
    })
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
 * Request sales by category report
 * @param {Object} params - Report parameters
 * @param {string} params.period - Time period (e.g., 'last_week') or use from/to
 * @param {string} params.from - Start date (YYYY-MM-DD)
 * @param {string} params.to - End date (YYYY-MM-DD)
 * @param {string} params.store_id - Optional store ID to filter by
 * @returns {Promise<Object>} - Report data
 */
export async function requestSalesByCategory(params = {}) {
  const token = await supabase.auth.getSession();
  const jwt = token?.data?.session?.access_token;

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
    },
    body: JSON.stringify({
      report: 'sales_by_category',
      params
    })
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
 * Request sales summary report
 * @param {Object} params - Report parameters
 * @param {string} params.period - Time period (e.g., 'last_week') or use from/to
 * @param {string} params.from - Start date (YYYY-MM-DD)
 * @param {string} params.to - End date (YYYY-MM-DD)
 * @param {string} params.store_id - Optional store ID to filter by
 * @returns {Promise<Object>} - Report data
 */
export async function requestSalesSummary(params = {}) {
  const token = await supabase.auth.getSession();
  const jwt = token?.data?.session?.access_token;

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
    },
    body: JSON.stringify({
      report: 'sales_summary',
      params
    })
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
 * Get the available reports schema
 * @returns {Promise<Object>} - Schema information
 */
export async function getReportsSchema() {
  const token = await supabase.auth.getSession();
  const jwt = token?.data?.session?.access_token;

  if (!jwt) {
    throw new Error('No hay sesión activa. Por favor, inicie sesión para acceder a los reportes.');
  }

  const reportingUrl = import.meta.env.VITE_SUPABASE_URL.replace('supabase.co', 'functions.supabase.co');
  const response = await fetch(`${reportingUrl}/reporting`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('No autorizado. Verifique su sesión e intente nuevamente.');
    } else if (response.status === 403) {
      throw new Error('Acceso denegado. Se requiere rol de administrador para acceder a los reportes.');
    } else {
      throw new Error(`Error fetching schema: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
}

/**
 * Check the reporting API status
 * @returns {Promise<Object>} - Status information
 */
export async function getReportStatus() {
  const token = await supabase.auth.getSession();
  const jwt = token?.data?.session?.access_token;

  if (!jwt) {
    throw new Error('No hay sesión activa. Por favor, inicie sesión para acceder a los reportes.');
  }

  const reportingUrl = import.meta.env.VITE_SUPABASE_URL.replace('supabase.co', 'functions.supabase.co');
  const response = await fetch(`${reportingUrl}/reporting/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('No autorizado. Verifique su sesión e intente nuevamente.');
    } else if (response.status === 403) {
      throw new Error('Acceso denegado. Se requiere rol de administrador para acceder a los reportes.');
    } else {
      throw new Error(`Error checking status: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
}

/**
 * Helper function to get auth token
 * @private
 */
async function getAuthToken() {
  const token = await supabase.auth.getSession();
  return token?.data?.session?.access_token;
}