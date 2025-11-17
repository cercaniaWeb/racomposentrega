// src/features/reports/ReportsPage.jsx
// Main page for reports functionality

import React, { useState } from 'react';
import TopProductsReport from './TopProductsReport';
import { requestSalesByCategory, requestSalesSummary } from '../../services/reportsApi';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('top_products');

  // Component for Sales by Category
  const SalesByCategoryReport = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('last_week');

    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = { period: period };
        const response = await requestSalesByCategory(params);
        setReportData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleRefresh = () => {
      fetchReport();
    };

    if (error) {
      return (
        <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-6">
          <h3 className="text-xl font-bold text-[#F0F0F0] mb-4">Ventas por Categoría</h3>
          <div className="text-red-400">Error: {error}</div>
        </div>
      );
    }

    return (
      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#F0F0F0]">Ventas por Categoría</h3>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-[#8A2BE2] text-white px-4 py-2 rounded-lg hover:bg-[#7a1bd2] disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm text-[#F0F0F0] mb-1">Periodo</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded px-3 py-2"
          >
            <option value="last_week">Semana pasada</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8A2BE2]"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {reportData && reportData.length > 0 ? (
              reportData.map((category, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-[#1D1D27] rounded-lg">
                  <div>
                    <div className="font-medium text-[#F0F0F0]">{category.category_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#F0F0F0]">{category.units_sold} unidades</div>
                    <div className="text-sm text-[#a0a0b0]">${Number(category.revenue).toFixed(2)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-[#a0a0b0] py-8">No se encontraron datos para este periodo</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Component for Sales Summary
  const SalesSummaryReport = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('last_week');

    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = { period: period };
        const response = await requestSalesSummary(params);
        if (response.data && response.data.length > 0) {
          setReportData(response.data[0]); // Summary returns a single row
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleRefresh = () => {
      fetchReport();
    };

    if (error) {
      return (
        <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-6">
          <h3 className="text-xl font-bold text-[#F0F0F0] mb-4">Resumen de Ventas</h3>
          <div className="text-red-400">Error: {error}</div>
        </div>
      );
    }

    return (
      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#F0F0F0]">Resumen de Ventas</h3>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-[#8A2BE2] text-white px-4 py-2 rounded-lg hover:bg-[#7a1bd2] disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm text-[#F0F0F0] mb-1">Periodo</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded px-3 py-2"
          >
            <option value="last_week">Semana pasada</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8A2BE2]"></div>
          </div>
        ) : reportData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1D1D27] rounded-lg text-center">
              <div className="text-2xl font-bold text-[#F0F0F0]">${Number(reportData.total_sales).toFixed(2)}</div>
              <div className="text-sm text-[#a0a0b0]">Ventas Totales</div>
            </div>
            <div className="p-4 bg-[#1D1D27] rounded-lg text-center">
              <div className="text-2xl font-bold text-[#F0F0F0]">{reportData.total_transactions}</div>
              <div className="text-sm text-[#a0a0b0]">Transacciones</div>
            </div>
            <div className="p-4 bg-[#1D1D27] rounded-lg text-center">
              <div className="text-2xl font-bold text-[#F0F0F0]">${Number(reportData.avg_transaction_value).toFixed(2)}</div>
              <div className="text-sm text-[#a0a0b0]">Promedio Transacción</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-[#a0a0b0] py-8">No se encontraron datos para este periodo</div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#181822] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#F0F0F0] mb-6">Sistema de Reportes</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-[#3a3a4a] mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'top_products'
                ? 'text-[#8A2BE2] border-b-2 border-[#8A2BE2]'
                : 'text-[#a0a0b0] hover:text-[#F0F0F0]'
            }`}
            onClick={() => setActiveTab('top_products')}
          >
            Productos Más Vendidos
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'sales_by_category'
                ? 'text-[#8A2BE2] border-b-2 border-[#8A2BE2]'
                : 'text-[#a0a0b0] hover:text-[#F0F0F0]'
            }`}
            onClick={() => setActiveTab('sales_by_category')}
          >
            Ventas por Categoría
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'sales_summary'
                ? 'text-[#8A2BE2] border-b-2 border-[#8A2BE2]'
                : 'text-[#a0a0b0] hover:text-[#F0F0F0]'
            }`}
            onClick={() => setActiveTab('sales_summary')}
          >
            Resumen de Ventas
          </button>
        </div>
        
        {/* Tab Content */}
        <div>
          {activeTab === 'top_products' && <TopProductsReport />}
          {activeTab === 'sales_by_category' && <SalesByCategoryReport />}
          {activeTab === 'sales_summary' && <SalesSummaryReport />}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;