// src/lib/ai-service.js
// Service for handling AI interactions with function calling

import OpenAI from 'openai';
import { getCategoryNames } from '../utils/supabaseAPI';
import { parseDateReference, calculatePreviousPeriod } from '../utils/date-utils';

let openai;

// Check if we have the API key before initializing OpenAI
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('OPENAI_API_KEY not found. AI functionality will not work.');
  // Create a mock client for development/testing purposes
  openai = null;
}

// Cache for category names to avoid repeated API calls
let cachedCategoryNames = [];
let categoryNamesLastUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to get category names with caching
async function loadCategoryNamesWithCache() {
  const now = Date.now();

  // If cache is valid, return cached values
  if (cachedCategoryNames.length > 0 &&
      categoryNamesLastUpdate &&
      (now - categoryNamesLastUpdate) < CACHE_DURATION) {
    return cachedCategoryNames;
  }

  try {
    const categoryNames = await getCategoryNames();
    cachedCategoryNames = categoryNames;
    categoryNamesLastUpdate = now;
    return categoryNames;
  } catch (error) {
    console.error('Error getting category names for AI service:', error);
    // Return empty array in case of error, but log the issue
    return [];
  }
}

// Function to create a regex pattern from available category names
function createCategoryRegexSync() {
  // If no categories are available, return a default pattern
  if (cachedCategoryNames.length === 0) {
    return /(lacteos|abarrotes|bebidas|vicio)/i; // Default pattern if no categories available
  }

  // Escape special regex characters in category names and join them
  const escapedNames = cachedCategoryNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = `(${escapedNames.join('|')})`;

  return new RegExp(pattern, 'i'); // Case-insensitive
}

// Initialize categories when the module loads
// This will start loading categories in the background
loadCategoryNamesWithCache().then(() => {
  console.log('Categorías cargadas para el servicio de IA');
}).catch(error => {
  console.error('Error inicializando categorías para el servicio de IA:', error);
});

// Helper function to format date to YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Define the functions that the AI can call to interact with our data
const functions = [
  {
    name: 'getSalesForCategory',
    description: 'Get sales data for a specific category within a date range',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'The product category (e.g., "lacteos", "abarrotes", "bebidas")' },
        dateRange: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' }
          },
          required: ['startDate', 'endDate']
        }
      },
      required: ['category', 'dateRange']
    }
  },
  {
    name: 'getInventoryReport',
    description: 'Get inventory levels for a specific category',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'The product category (e.g., "lacteos", "abarrotes", "bebidas")' },
        location: { type: 'string', description: 'The store location (optional)' }
      },
      required: ['category']
    }
  },
  {
    name: 'getSalesComparison',
    description: 'Compare sales between two periods',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'The product category (optional)' },
        currentPeriod: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: 'Start date of current period in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date of current period in YYYY-MM-DD format' }
          },
          required: ['startDate', 'endDate']
        },
        previousPeriod: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: 'Start date of previous period in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date of previous period in YYYY-MM-DD format' }
          },
          required: ['startDate', 'endDate']
        }
      }
    }
  }
];

function _parseQueryWithPatternMatching(query) {
  const lowerQuery = query.toLowerCase();

  // Extract location if mentioned
  let location = null;
  if (lowerQuery.includes('tienda 1') || lowerQuery.includes('store 1') || lowerQuery.includes('ubicación tienda1')) {
    location = 'tienda1';
  } else if (lowerQuery.includes('tienda 2') || lowerQuery.includes('store 2') || lowerQuery.includes('ubicación tienda2')) {
    location = 'tienda2';
  } else if (lowerQuery.includes('bodega central') || lowerQuery.includes('warehouse') || lowerQuery.includes('ubicación bodega')) {
    location = 'bodega-central';
  }

  // Check for inventory queries
  if (lowerQuery.includes('inventario') || lowerQuery.includes('existencias') || lowerQuery.includes('stock')) {
    // Extract category if mentioned (using dynamic categories)
    const categoryRegex = createCategoryRegexSync();
    const categoryMatch = lowerQuery.match(categoryRegex);
    const category = categoryMatch ? categoryMatch[1] : null;

    return {
      type: 'getInventoryReport',
      category: category || null,
      location: location || null
    };
  }

  // Check for date references in the query first to determine if it's a specific date query
  const dateRange = parseDateReference(query);
  
  // Check if the user is asking for specific sales data for a day/range without comparison
  const isSpecificSalesQuery = lowerQuery.includes('fueron las ventas') || 
                              lowerQuery.includes('fue la venta') || 
                              lowerQuery.includes('venta de') ||
                              lowerQuery.includes('ventas de') ||
                              lowerQuery.includes('total de ventas') ||
                              lowerQuery.includes('venta total');
  
  // If it's a specific sales query with a date, we should use getSalesForCategory instead of comparison
  if (isSpecificSalesQuery && dateRange) {
    // Extract category if mentioned (using dynamic categories)
    const categoryRegex = createCategoryRegexSync();
    const categoryMatch = lowerQuery.match(categoryRegex);
    const category = categoryMatch ? categoryMatch[1] : null;
    
    return {
      type: 'getSalesForCategory',
      category: category || null,
      dateRange: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }
    };
  }
  
  // Check for sales queries
  if (lowerQuery.includes('venta') || lowerQuery.includes('ventas')) {
    // Extract category if mentioned (using dynamic categories)
    const categoryRegex = createCategoryRegexSync();
    const categoryMatch = lowerQuery.match(categoryRegex);
    const category = categoryMatch ? categoryMatch[1] : null;

    // If date range is specified, return comparison
    if (dateRange) {
      // Calculate previous period based on the current period
      const previousPeriod = calculatePreviousPeriod(dateRange);
      
      // Return sales comparison for the specified date range
      return {
        type: 'getSalesComparison',
        category: category || null,
        currentPeriod: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        previousPeriod: previousPeriod
      };
    } else {
      // Default to last 7 days if no specific date range is mentioned
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      const currentPeriod = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      };
      
      const previousPeriod = calculatePreviousPeriod(currentPeriod);
      
      return {
        type: 'getSalesComparison',
        category: category || 'lacteos',
        currentPeriod: currentPeriod,
        previousPeriod: previousPeriod
      };
    }
  }

  // Check if the query includes date references but not specifically about sales comparison
  if (dateRange && !lowerQuery.includes('comparación')) {
    // Extract category if mentioned (using dynamic categories)
    const categoryRegex = createCategoryRegexSync();
    const categoryMatch = lowerQuery.match(categoryRegex);
    const category = categoryMatch ? categoryMatch[1] : null;
    
    // If it's a specific sales query, use getSalesForCategory
    if (isSpecificSalesQuery) {
      return {
        type: 'getSalesForCategory',
        category: category || null,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      };
    } else {
      // Otherwise, default to comparison
      const previousPeriod = calculatePreviousPeriod(dateRange);
      
      return {
        type: 'getSalesComparison',
        category: category || null,
        currentPeriod: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        previousPeriod: previousPeriod
      };
    }
  }

  // Default return
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  const currentPeriod = {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };

  const previousPeriod = calculatePreviousPeriod(currentPeriod);

  return {
    type: 'getSalesComparison',
    category: 'lacteos',
    currentPeriod: currentPeriod,
    previousPeriod: previousPeriod
  };
}

/**
 * Parse natural language query using OpenAI function calling
 * @param {string} query - The natural language query from the user
 * @returns {object} - The parsed intent and parameters
 */
export async function parseNaturalLanguageQuery(query) {
  if (!openai) {
    // Fallback: use simple pattern matching if OpenAI API is not configured
    return _parseQueryWithPatternMatching(query);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4' if you prefer
      messages: [
        {
          role: 'system',
          content: `Eres un asistente de inteligencia artificial para un sistema de punto de venta (POS) de un abarrotes.
          Tu función es interpretar las consultas del usuario y determinar qué tipo de reporte quiere generar.
          Las consultas pueden ser sobre ventas, inventario, comparaciones de ventas entre periodos, etc.
          Debes identificar la intención y extraer los parámetros relevantes como categorías, fechas, ubicaciones, etc.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      functions: functions,
      function_call: 'auto'
    });

    const message = response.choices[0].message;

    if (message.function_call) {
      // Parse the function call
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);

      // Return in our standard format
      return {
        type: functionName,
        ...functionArgs
      };
    } else {
      // If no function call was made, we need to determine the intent ourselves
      // This might happen if the AI doesn't recognize a specific function to call

      // Default to a sales comparison if we can't determine intent
      return {
        type: 'getSalesComparison',
        category: 'lacteos',
        currentPeriod: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        previousPeriod: {
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);

    // Fallback: use simple pattern matching if AI API fails
    return _parseQueryWithPatternMatching(query);
  }
}