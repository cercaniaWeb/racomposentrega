// src/features/reports/TopProductsReport.jsx
// Component for displaying top products report

import React, { useState, useEffect } from 'react';
import { requestTopProducts } from '../../services/reportsApi';

const TopProductsReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('last_week');
  const [limit, setLimit] = useState(3);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        period: period,
        limit: parseInt(limit)
      };
      
      const response = await requestTopProducts(params);
      setReportData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleRefresh = () => {
    fetchReport();
  };

  if (error) {
    return (
      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-6">
        <h3 className="text-xl font-bold text-[#F0F0F0] mb-4">Productos Más Vendidos</h3>
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#F0F0F0]">Productos Más Vendidos</h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-[#8A2BE2] text-white px-4 py-2 rounded-lg hover:bg-[#7a1bd2] disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>
      
      <div className="mb-4 flex space-x-4">
        <div>
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
        
        <div>
          <label className="block text-sm text-[#F0F0F0] mb-1">Límite</label>
          <input
            type="number"
            min="1"
            max="100"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded px-3 py-2 w-20"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8A2BE2]"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {reportData && reportData.length > 0 ? (
            reportData.map((product, index) => (
              <div key={product.product_id} className="flex justify-between items-center p-3 bg-[#1D1D27] rounded-lg">
                <div className="flex items-center">
                  <span className="text-[#a0a0b0] mr-3">#{index + 1}</span>
                  <div>
                    <div className="font-medium text-[#F0F0F0]">{product.name}</div>
                    <div className="text-sm text-[#a0a0b0]">ID: {product.product_id}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-[#F0F0F0]">{product.units_sold} unidades</div>
                  <div className="text-sm text-[#a0a0b0]">${Number(product.revenue).toFixed(2)}</div>
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

export default TopProductsReport;