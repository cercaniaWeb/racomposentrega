// src/utils/date-utils.js
// Utility functions for handling date references in natural language

/**
 * Parse common date references to actual date ranges
 * @param {string} query - The user query to analyze for date references
 * @returns {object} - Object containing date range or null if no date reference found
 */
export function parseDateReference(query) {
  const lowerQuery = query.toLowerCase();
  const today = new Date();
  
  // Set time to start of day for proper date comparison
  today.setHours(0, 0, 0, 0);
  
  // Calculate dates
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Pattern matching for different date references
  if (lowerQuery.includes('ayer') || lowerQuery.includes('el día de ayer') || lowerQuery.includes('día anterior')) {
    return {
      startDate: formatDate(yesterday),
      endDate: formatDate(yesterday),
      description: 'ayer'
    };
  }
  
  if (lowerQuery.includes('hoy') || lowerQuery.includes('el día de hoy') || lowerQuery.includes('día actual')) {
    return {
      startDate: formatDate(today),
      endDate: formatDate(today),
      description: 'hoy'
    };
  }
  
  if (lowerQuery.includes('esta semana')) {
    return {
      startDate: formatDate(startOfWeek),
      endDate: formatDate(today),
      description: 'esta semana'
    };
  }
  
  if (lowerQuery.includes('este mes')) {
    return {
      startDate: formatDate(startOfMonth),
      endDate: formatDate(today),
      description: 'este mes'
    };
  }
  
  if (lowerQuery.includes('semana pasada') || lowerQuery.includes('la semana anterior')) {
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(startOfWeek.getDate() - 1);
    
    return {
      startDate: formatDate(startOfLastWeek),
      endDate: formatDate(endOfLastWeek),
      description: 'la semana pasada'
    };
  }
  
  if (lowerQuery.includes('mes pasado') || lowerQuery.includes('el mes anterior')) {
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    return {
      startDate: formatDate(startOfLastMonth),
      endDate: formatDate(endOfLastMonth),
      description: 'el mes pasado'
    };
  }
  
  // Check for specific date patterns (DD/MM/YYYY or DD-MM-YYYY)
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/;
  const dateMatch = lowerQuery.match(datePattern);
  
  if (dateMatch) {
    const date = parseDateString(dateMatch[0]);
    if (date) {
      return {
        startDate: formatDate(date),
        endDate: formatDate(date),
        description: `el ${formatDate(date)}`
      };
    }
  }
  
  // Check for date ranges (e.g., from DD/MM/YYYY to DD/MM/YYYY)
  const dateRangePattern = /(?:del|desde)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+(?:al|hasta)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/;
  const rangeMatch = lowerQuery.match(dateRangePattern);
  
  if (rangeMatch) {
    const startDate = parseDateString(rangeMatch[1]);
    const endDate = parseDateString(rangeMatch[2]);
    
    if (startDate && endDate) {
      return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        description: `del ${formatDate(startDate)} al ${formatDate(endDate)}`
      };
    }
  }
  
  // Default: return null if no date reference found
  return null;
}

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string in DD/MM/YYYY or DD-MM-YYYY format
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} - Parsed date or null if invalid
 */
function parseDateString(dateString) {
  try {
    // Replace hyphens with slashes for consistent processing
    const normalizedDate = dateString.replace(/-/g, '/');
    
    // Split by '/' to get day, month, year
    const parts = normalizedDate.split('/');
    
    if (parts.length !== 3) {
      return null;
    }
    
    // Assuming format is DD/MM/YYYY
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    
    // Verify the date is valid (e.g., not "32/13/2023")
    if (date.getFullYear() !== year || 
        date.getMonth() !== month || 
        date.getDate() !== day) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing date string:', dateString, error);
    return null;
  }
}

/**
 * Calculate the previous period for comparison based on the current period
 * @param {object} currentPeriod - Object with startDate and endDate
 * @returns {object} - Object with previous period startDate and endDate
 */
export function calculatePreviousPeriod(currentPeriod) {
  const currentStart = new Date(currentPeriod.startDate);
  const currentEnd = new Date(currentPeriod.endDate);
  
  // Calculate the duration of the current period
  const durationInDays = (currentEnd - currentStart) / (1000 * 60 * 60 * 24);
  
  // Calculate previous period based on the same duration
  const previousEnd = new Date(currentStart);
  previousEnd.setDate(currentStart.getDate() - 1); // Day before the current period starts
  
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousEnd.getDate() - durationInDays);
  
  return {
    startDate: formatDate(previousStart),
    endDate: formatDate(previousEnd)
  };
}