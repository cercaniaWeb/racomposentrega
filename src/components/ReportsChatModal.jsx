import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../config/supabase';

const ReportsChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! Soy tu asistente para generar reportes. Puedes pedirme reportes como: "productos más vendidos de esta semana", "ventas por categoría del mes pasado", "resumen de ventas de la tienda 1", etc.', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to parse natural language into report parameters
  const parseReportRequest = (text) => {
    const lowerText = text.toLowerCase();
    
    // Identify report type
    let reportType = null;
    if (lowerText.includes('producto') && (lowerText.includes('vendido') || lowerText.includes('venta'))) {
      reportType = 'top_products';
    } else if (lowerText.includes('categor') && (lowerText.includes('venta') || lowerText.includes('vendido'))) {
      reportType = 'sales_by_category';
    } else if (lowerText.includes('resumen') || lowerText.includes('summary') || lowerText.includes('total')) {
      reportType = 'sales_summary';
    }

    // Identify time period
    let period = null;
    let from = null;
    let to = null;
    
    if (lowerText.includes('semana') && lowerText.includes('pasad')) {
      period = 'last_week';
    } else if (lowerText.includes('semana') && (lowerText.includes('esta') || lowerText.includes('actual'))) {
      // Calculate this week's date range (Monday to Sunday)
      const now = new Date();
      const dayOfWeek = now.getUTCDay(); // Sunday = 0, Monday = 1, etc.
      const daysSinceMonday = (dayOfWeek + 6) % 7; // Adjust to make Monday = 0
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setUTCDate(now.getUTCDate() - daysSinceMonday);
      startOfThisWeek.setUTCHours(0, 0, 0, 0);
      
      const endOfThisWeek = new Date(startOfThisWeek);
      endOfThisWeek.setUTCDate(startOfThisWeek.getUTCDate() + 6);
      endOfThisWeek.setUTCHours(23, 59, 59, 999);
      
      from = startOfThisWeek.toISOString().split('T')[0];
      to = endOfThisWeek.toISOString().split('T')[0];
    } else if (lowerText.includes('mes') && lowerText.includes('pasad')) {
      const now = new Date();
      const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      from = firstDayOfPrevMonth.toISOString().split('T')[0];
      to = lastDayOfPrevMonth.toISOString().split('T')[0];
    } else if (lowerText.includes('mes') && (lowerText.includes('este') || lowerText.includes('actual'))) {
      const now = new Date();
      const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      from = firstDayOfThisMonth.toISOString().split('T')[0];
      to = lastDayOfThisMonth.toISOString().split('T')[0];
    } else if (lowerText.includes('hoy') || lowerText.includes('día de hoy')) {
      const today = new Date().toISOString().split('T')[0];
      from = today;
      to = today;
    } else if (lowerText.includes('ayer')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      from = dateStr;
      to = dateStr;
    } else if (lowerText.includes('fecha') && lowerText.includes('a')) {
      // Simple date range parsing: "del 1 al 10 de enero" or "from january 1 to january 10"
      const dateMatch = text.match(/(\d{1,2})\s*(a|al|to)\s*(\d{1,2})/);
      if (dateMatch) {
        const startDay = parseInt(dateMatch[1]);
        const endDay = parseInt(dateMatch[3]);
        if (startDay && endDay) {
          // This is simplified - in a real app, you'd need more sophisticated date parsing
          const now = new Date();
          from = new Date(now.getFullYear(), now.getMonth(), startDay).toISOString().split('T')[0];
          to = new Date(now.getFullYear(), now.getMonth(), endDay).toISOString().split('T')[0];
        }
      }
    }

    // Identify store
    let storeId = null;
    if (lowerText.includes('tienda') || lowerText.includes('store')) {
      const storeMatch = text.match(/(tienda|store)\s*(\d+)/);
      if (storeMatch) {
        storeId = storeMatch[2]; // This would need to be mapped to actual store IDs
      }
    }

    // Identify limit
    let limit = null;
    const limitMatch = text.match(/(\d+)\s*(productos|más vendidos|top)/);
    if (limitMatch) {
      limit = parseInt(limitMatch[1]);
    }

    return {
      reportType,
      params: {
        period: period,
        from: from,
        to: to,
        store_id: storeId,
        limit: limit
      }
    };
  };

  // Import the Supabase client and API functions
  const requestReport = async (reportType, params) => {
    try {
      // For now, using the hardcoded auth token you provided for testing
      // NOTE: This is not secure for production - implement proper user authentication
      let jwt = "sb-pgbefqzlrvjnsymigfmv-auth-token"; // Your auth token
      
      if (!jwt) {
        // Fallback to session if needed
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Session error:', sessionError);
          throw new Error('No hay sesión activa. Por favor, inicie sesión para acceder a los reportes.');
        }
        
        const sessionJwt = session.access_token;
        
        if (!sessionJwt) {
          throw new Error('No se pudo obtener el token de autenticación.');
        }
        
        jwt = sessionJwt;
      }
      
      if (!jwt) {
        throw new Error('No hay sesión activa. Por favor, inicie sesión para acceder a los reportes.');
      }
      
      // Using the correct URL format based on the working curl command
      // The function is deployed at the functions domain, not the main supabase domain
      const reportingUrl = import.meta.env.VITE_SUPABASE_URL.replace('supabase.co', 'functions.supabase.co');
      const response = await fetch(`${reportingUrl}/reporting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          reportType: reportType,
          ...params,
          p_from: params.from || null,
          p_to: params.to || null,
          p_limit: params.limit || null,
          p_store_id: params.store_id || null
        })
      });
      
      if (!response.ok) {
        // Try to get error details from response
        let errorDetails = '';
        try {
          const errorResponse = await response.json();
          errorDetails = errorResponse.error || errorResponse.message || response.statusText;
        } catch (e) {
          errorDetails = response.statusText;
        }
        
        if (response.status === 401) {
          throw new Error(`No autorizado: ${errorDetails}`);
        } else if (response.status === 403) {
          throw new Error(`Acceso denegado: ${errorDetails}`);
        } else {
          throw new Error(`Error ${response.status}: ${errorDetails}`);
        }
      }
      
      return response.json();
    } catch (error) {
      console.error('Error requesting report:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Parse the user's request
      const parsedRequest = parseReportRequest(inputValue);
      
      if (!parsedRequest.reportType) {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, 
            text: 'No pude entender qué tipo de reporte deseas. Puedes pedirme reportes como "productos más vendidos", "ventas por categoría" o "resumen de ventas".', 
            sender: 'bot' 
          }
        ]);
        setIsLoading(false);
        return;
      }

      // Request the report
      const reportResult = await requestReport(parsedRequest.reportType, parsedRequest.params);

      // Add bot response with report data
      let reportMessage = '';
      // The response format might be different based on the actual API response
      // The reportResult is the direct response from the API
      if (reportResult && reportResult.data) {
        switch (parsedRequest.reportType) {
          case 'top_products':
            if (Array.isArray(reportResult.data)) {
              reportMessage = 'Reporte de productos más vendidos:\n' + 
                reportResult.data.map(p => `• ${p.name || p.product_name}: ${p.units_sold || p.quantity || 'N/A'} unidades vendidas, $${p.revenue || p.total_revenue || '0'} en ventas`).join('\n');
            } else {
              reportMessage = `Reporte de productos más vendidos: ${JSON.stringify(reportResult.data, null, 2)}`;
            }
            break;
          case 'sales_by_category':
            if (Array.isArray(reportResult.data)) {
              reportMessage = 'Reporte de ventas por categoría:\n' + 
                reportResult.data.map(c => `• ${c.category_name || c.name}: $${c.revenue || c.total_revenue || '0'} en ventas, ${c.units_sold || c.quantity || '0'} unidades`).join('\n');
            } else {
              reportMessage = `Reporte de ventas por categoría: ${JSON.stringify(reportResult.data, null, 2)}`;
            }
            break;
          case 'sales_summary':
            if (reportResult.data && typeof reportResult.data === 'object') {
              reportMessage = `Resumen de ventas:\n` +
                `• Ventas totales: $${reportResult.data.total_sales || reportResult.data.total_revenue || '0'}\n` +
                `• Transacciones: ${reportResult.data.total_transactions || reportResult.data.transaction_count || '0'}\n` +
                `• Valor promedio: $${reportResult.data.avg_transaction_value || '0'}\n` +
                `• Producto más vendido: ${reportResult.data.top_product_name || reportResult.data.best_selling_product || 'N/A'}`;
            } else {
              reportMessage = `Resumen de ventas: ${JSON.stringify(reportResult.data, null, 2)}`;
            }
            break;
        }
      } else {
        reportMessage = `Datos del reporte: ${JSON.stringify(reportResult, null, 2)}`;
      }

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 2, text: reportMessage, sender: 'bot' }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { 
          id: Date.now() + 2, 
          text: `Error al generar el reporte: ${error.message || 'Ocurrió un error desconocido'}`, 
          sender: 'bot' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Asistente de Reportes</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu solicitud de reporte aquí..."
              className="flex-1 border border-gray-300 rounded-lg p-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Ejemplos: "productos más vendidos de esta semana", "ventas por categoría de enero", "resumen de ventas tienda 1"
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsChatModal;