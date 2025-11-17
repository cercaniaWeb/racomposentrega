import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  X,
  Settings,
  TrendingUp,
  BarChart2,
  FileText,
  Clock,
  Calendar,
  Layers,
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Tag,
} from 'lucide-react';

// --- DATOS MOCK DE REPORTES DISPONIBLES (Basado en funcion-reportig.txt) ---
const AVAILABLE_REPORTS = [
  {
    name: "top_products",
    title: "Productos Más Vendidos",
    description: "Identifica los artículos que generaron mayor volumen de ventas.",
    icon: TrendingUp,
    params: [
      { id: "period", type: "select", options: ["last_week", "custom"], label: "Período de Análisis", default: "last_week" },
      { id: "limit", type: "number", label: "Límite (Max 100)", default: 3 },
      { id: "store_id", type: "text", label: "ID de Sucursal (Opcional)" },
    ]
  },
  {
    name: "sales_summary",
    title: "Resumen Global de Ventas",
    description: "Muestra métricas clave como ingresos totales y número de transacciones.",
    icon: BarChart2,
    params: [
      { id: "period", type: "select", options: ["last_week", "custom"], label: "Período de Análisis", default: "last_week" },
      { id: "store_id", type: "text", label: "ID de Sucursal (Opcional)" },
    ]
  },
  {
    name: "sales_by_category",
    title: "Ventas por Categoría",
    description: "Desglose de las ventas por las categorías de productos.",
    icon: Layers,
    params: [
      { id: "period", type: "select", options: ["last_week", "custom"], label: "Período de Análisis", default: "last_week" },
      { id: "store_id", type: "text", label: "ID de Sucursal (Opcional)" },
    ]
  },
];

// --- COMPONENTE PRINCIPAL ---

const AIReportModal = ({ isOpen, onClose }) => {
  const [selectedReportName, setSelectedReportName] = useState('top_products');
  const [params, setParams] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportResult, setReportResult] = useState(null); // Contiene data, error, o null
  const [errorMessage, setErrorMessage] = useState('');

  // Reporte actualmente seleccionado
  const selectedReport = useMemo(() => 
    AVAILABLE_REPORTS.find(r => r.name === selectedReportName)
  , [selectedReportName]);

  // Inicializa los parámetros cuando cambia el reporte
  useEffect(() => {
    if (selectedReport) {
      const initialParams = {};
      selectedReport.params.forEach(p => {
        initialParams[p.id] = p.default || '';
      });
      setParams(initialParams);
      setReportResult(null);
      setErrorMessage('');
    }
  }, [selectedReport]);
  
  
  // Función de simulación de la API (gemini-2.5-flash-preview-09-2025)
  // Simula la llamada a la función remota /reporting (POST)
  const simulateApiCall = useCallback(async (reportName, reportParams) => {
    // 1. Simulación de validación de parámetros
    if (reportParams.period === 'custom' && (!reportParams.from || !reportParams.to)) {
      throw new Error("Debe especificar las fechas 'Desde' y 'Hasta' para el período personalizado.");
    }
    if (reportName === 'top_products' && (reportParams.limit > 100 || reportParams.limit < 1)) {
        throw new Error("El límite de productos debe ser entre 1 y 100.");
    }
    
    // 2. Simulación de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latencia
    
    // 3. Simulación de resultados
    if (reportName === 'top_products') {
      const mockData = [
        { product_name: 'Refresco Cola (Lata)', total_sales: 520.50, units_sold: 520 },
        { product_name: 'Huevos (Docena)', total_sales: 384.00, units_sold: 120 },
        { product_name: 'Pan de Molde Blanco', total_sales: 330.00, units_sold: 120 },
      ];
      return { data: mockData, success: true };
    } else if (reportName === 'sales_summary') {
      return { 
        data: [{ 
          total_revenue: 12050.75, 
          transaction_count: 850, 
          avg_ticket: 14.18 
        }], 
        success: true 
      };
    } else if (reportName === 'sales_by_category') {
        const mockData = [
            { category: 'Abarrotes', total_sales: 4500.00 },
            { category: 'Bebidas', total_sales: 3200.50 },
            { category: 'Lacteos', total_sales: 2850.25 },
        ];
        return { data: mockData, success: true };
    } else {
      throw new Error("Reporte no soportado por la simulación.");
    }
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedReportName) return;

    setIsProcessing(true);
    setErrorMessage('');
    setReportResult(null);

    // Limpia las fechas si el período es 'last_week' antes de enviar, para evitar errores de API
    const finalParams = { ...params };
    if (finalParams.period === 'last_week') {
        delete finalParams.from;
        delete finalParams.to;
    }

    try {
      // Nota: En un entorno real, aquí iría la llamada fetch con el JWT
      // Ejemplo: await fetch('/reporting', { method: 'POST', body: JSON.stringify({ report: selectedReportName, params: finalParams }) });
      const response = await simulateApiCall(selectedReportName, finalParams);
      
      if (response.success) {
        setReportResult(response.data);
      } else {
        throw new Error(response.error || "Error desconocido al generar el reporte.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setErrorMessage(error.message || "No se pudo conectar con el motor de reportes de IA.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para renderizar los campos de entrada de parámetros
  const renderParamInput = useCallback((param) => {
    const value = params[param.id] || '';

    const handleInputChange = (e) => {
      let newValue = e.target.value;
      if (param.type === 'number') {
        // Asegura que sea un número válido
        newValue = parseFloat(newValue) || (newValue === '' ? '' : params[param.id]);
      }
      setParams(prev => ({ ...prev, [param.id]: newValue }));
    };

    const inputClasses = "w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm";
    
    let element;

    switch (param.type) {
      case 'select':
        element = (
          <select value={value} onChange={handleInputChange} className={inputClasses}>
            {param.options.map(opt => (
              <option key={opt} value={opt} className="bg-gray-700 text-white capitalize">{opt.replace('_', ' ')}</option>
            ))}
          </select>
        );
        break;
      case 'number':
      case 'text':
        element = (
          <input
            type={param.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={handleInputChange}
            placeholder={param.label}
            min={param.id === 'limit' ? 1 : undefined}
            max={param.id === 'limit' ? 100 : undefined}
            className={inputClasses}
          />
        );
        break;
      default:
        element = <input type="text" readOnly value="Tipo de parámetro no soportado" className={inputClasses + " opacity-50"} />;
    }

    return (
      <div key={param.id} className="mb-4">
        <label className="block text-xs font-medium text-gray-400 mb-1">{param.label}</label>
        {element}
      </div>
    );
  }, [params]);

  // Renderiza el contenido del reporte
  const renderReportContent = useCallback(() => {
    if (!reportResult) return null;

    if (selectedReportName === 'top_products') {
      return (
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <h4 className="text-xl font-bold text-blue-400 mb-4">Resultados: Productos Más Vendidos</h4>
          <table className="min-w-full divide-y divide-gray-600">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Producto</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Unidades Vendidas</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ventas Totales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {reportResult.map((item, index) => (
                <tr key={index} className="hover:bg-gray-600 transition-colors">
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-white">{item.product_name}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{item.units_sold}</td>
                  {/* FIX: Asegura que total_sales es un número antes de llamar toFixed(2) */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-green-400 text-right">${(item.total_sales || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (selectedReportName === 'sales_summary') {
      const summary = reportResult[0] || {};
      return (
        <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700 rounded-xl border border-gray-600 shadow-md">
                <p className="text-sm text-gray-400 flex items-center mb-1"><DollarSign className='w-4 h-4 mr-1 text-green-400'/> Ingresos Totales</p>
                <p className="text-3xl font-extrabold text-green-400">${summary.total_revenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-xl border border-gray-600 shadow-md">
                <p className="text-sm text-gray-400 flex items-center mb-1"><FileText className='w-4 h-4 mr-1 text-blue-400'/> # Transacciones</p>
                <p className="text-3xl font-extrabold text-white">{summary.transaction_count || 0}</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-xl border border-gray-600 shadow-md">
                <p className="text-sm text-gray-400 flex items-center mb-1"><Tag className='w-4 h-4 mr-1 text-yellow-400'/> Ticket Promedio</p>
                <p className="text-3xl font-extrabold text-white">${summary.avg_ticket?.toFixed(2) || '0.00'}</p>
            </div>
        </div>
      );
    } else if (selectedReportName === 'sales_by_category') {
        return (
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h4 className="text-xl font-bold text-blue-400 mb-4">Resultados: Ventas por Categoría</h4>
                {reportResult.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0">
                        <span className="text-sm font-medium text-white">{item.category}</span>
                        {/* FIX: Asegura que total_sales es un número antes de llamar toFixed(2) */}
                        <span className="text-lg font-bold text-green-400">${(item.total_sales || 0).toFixed(2)}</span>
                    </div>
                ))}
            </div>
        );
    }
    
    return <p className="text-gray-400">Formato de reporte no implementado para visualización.</p>;

  }, [reportResult, selectedReportName]);

  // Componente de entrada para fechas personalizadas
  const DateRangeInput = () => {
    if (params.period !== 'custom') return null;

    return (
      <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
        <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center">
                <Calendar className="w-3 h-3 mr-1"/> Desde
            </label>
            <input 
                type="date" 
                value={params.from || ''} 
                onChange={(e) => setParams(p => ({ ...p, from: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-blue-500 text-sm"
            />
        </div>
        <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center">
                <Calendar className="w-3 h-3 mr-1"/> Hasta
            </label>
            <input 
                type="date" 
                value={params.to || ''} 
                onChange={(e) => setParams(p => ({ ...p, to: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-blue-500 text-sm"
            />
        </div>
      </div>
    );
  };
  
  // Iconos para el renderizado del reporte simulado
  const { DollarSign, Tag } = { DollarSign: FileText, Tag: FileText }; // Lucide icons already imported

  // La regla de Hooks de React establece que los hooks (useState, useMemo, useEffect, useCallback, etc.)
  // deben ser llamados en el mismo orden en cada render. Mover la condición 'if (!isOpen)' aquí
  // asegura que todos los hooks se ejecuten incondicionalmente, evitando el error de orden de Hooks.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 font-inter">
        <style>
            {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
            `}
        </style>
        
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="bg-blue-600/20 p-2 rounded-lg mr-3">
              <Settings className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Generador de Reportes de Inteligencia</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido del modal (Grid 1/3, 2/3) */}
        <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-3">
          
          {/* Columna 1: Selección de Reporte */}
          <div className="bg-gray-800 p-4 border-r border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-400"/>
                Seleccionar Reporte
            </h3>
            <div className="space-y-3">
              {AVAILABLE_REPORTS.map(report => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.name}
                    onClick={() => setSelectedReportName(report.name)}
                    className={`
                      w-full p-4 rounded-xl text-left transition-all duration-200 border
                      ${selectedReportName === report.name
                        ? 'border-blue-500 bg-blue-600/20 text-blue-300 shadow-lg shadow-blue-900/30'
                        : 'border-gray-700 bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center mb-1">
                      <Icon className="w-5 h-5 mr-2" />
                      <span className="font-semibold text-white">{report.title}</span>
                    </div>
                    <p className="text-xs text-gray-400">{report.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna 2: Configuración y Resultados */}
          <div className="lg:col-span-2 p-6 flex flex-col">
            {selectedReport ? (
              <>
                {/* 2A: Configuración de Parámetros */}
                <div className="p-4 bg-gray-800 rounded-xl mb-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-yellow-400"/>
                        Parámetros de {selectedReport.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedReport.params.map(renderParamInput)}
                    </div>
                    
                    {/* Input de Rango de Fechas Condicional */}
                    <DateRangeInput />

                    {/* Botón de Generación */}
                    <button
                        onClick={handleGenerateReport}
                        disabled={isProcessing}
                        className={`
                            w-full mt-4 py-3 px-4 rounded-xl text-lg font-bold flex items-center justify-center transition-all duration-300 shadow-lg
                            ${isProcessing
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-[1.005]'
                            }
                        `}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 mr-2" />
                        )}
                        {isProcessing ? 'Generando Reporte...' : 'Generar Reporte'}
                    </button>
                    
                    {/* Mensaje de Error */}
                    {errorMessage && (
                        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2"/>
                            <p className="text-sm font-medium">{errorMessage}</p>
                        </div>
                    )}
                </div>

                {/* 2B: Panel de Resultados */}
                <div className="flex-1 min-h-48">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400"/>
                        Resultados
                    </h3>
                    
                    {isProcessing && (
                        <div className="flex flex-col items-center justify-center h-48 bg-gray-800 rounded-xl border border-gray-700 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3"/>
                            <p>Esperando la respuesta del motor de reportes...</p>
                        </div>
                    )}
                    
                    {reportResult && !isProcessing && (
                        <div className="mt-4">
                            {renderReportContent()}
                        </div>
                    )}

                    {!isProcessing && !reportResult && !errorMessage && (
                        <div className="flex flex-col items-center justify-center h-48 bg-gray-800 rounded-xl border border-gray-700 text-gray-500 p-4">
                            <Clock className="w-8 h-8 mb-3"/>
                            <p className="text-center">Configure los parámetros y presione "Generar Reporte" para ver los resultados aquí.</p>
                        </div>
                    )}
                </div>

              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Seleccione un tipo de reporte a la izquierda para comenzar la configuración.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente de Demostración para App.jsx ---

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Mismo estilo que el POS original
    const bgStyle = 'bg-gray-900 min-h-screen flex items-center justify-center p-8';
    const buttonStyle = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.05] flex items-center';

    return (
        <div className={bgStyle}>
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-blue-400 mb-8">POS Abarrotes - Módulo de Reportes</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={buttonStyle}
                >
                    <BarChart2 className="w-6 h-6 mr-2" />
                    Abrir Generador de Reportes IA
                </button>
            </div>
            
            <AIReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default App;
