import React, { useState, useEffect } from 'react';
import { fetchReportData, fetchReportMetrics } from '../services/reportService';
import ReportsTable from './ReportsTable';
import { MetricCard, ProgressIndicator, StatusBadge } from './MetricIndicators';
import { BarChart, DonutChart, TrendIndicator } from './ChartVisualizations';
import { DollarSign, Package, ShoppingCart, TrendingUp, TrendingDown, AlertTriangle, Users, BarChart3 } from 'lucide-react';

const PrebuiltReports = ({ filters }) => {
  const [activeReport, setActiveReport] = useState('sales-summary');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [metrics, setMetrics] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReportDataFromService();
    fetchMetrics();
  }, [activeReport, filters, currentPage, sortConfig]);

  const fetchReportDataFromService = async () => {
    setLoading(true);
    try {
      const result = await fetchReportData(activeReport, filters);
      setReportData(result);

      // Calculate total pages based on data (in a real app, this would come from the API)
      // For now, we'll set it to 1 since we don't have pagination on the backend yet
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const metricsData = await fetchReportMetrics(filters);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching report metrics:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const reportTypes = [
    { id: 'sales-summary', name: 'Resumen de Ventas', icon: DollarSign },
    { id: 'top-products', name: 'Productos Más Vendidos', icon: ShoppingCart },
    { id: 'inventory', name: 'Inventario', icon: Package },
    { id: 'sales-comparison', name: 'Comparación de Ventas', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Ventas Totales"
            value={`$${metrics.totalSales.toLocaleString()}`}
            change={12.5}
            icon={DollarSign}
            color="green"
          />
          <MetricCard
            title="Transacciones"
            value={metrics.totalTransactions}
            change={8.3}
            icon={ShoppingCart}
            color="blue"
          />
          <MetricCard
            title="Productos"
            value={metrics.totalProducts}
            change={-2.1}
            icon={Package}
            color="purple"
          />
          <MetricCard
            title="Inventario Total"
            value={metrics.totalInventory}
            change={5.7}
            icon={Package}
            color="indigo"
          />
        </div>
      )}

      {/* Chart Visualizations */}
      {activeReport === 'sales-summary' && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendIndicator
            value={12.5}
            title="Crecimiento de Ventas"
            isPositive={true}
            icon={TrendingUp}
          />
          <TrendIndicator
            value={-2.1}
            title="Cambio de Productos"
            isPositive={false}
            icon={TrendingDown}
          />
        </div>
      )}

      {activeReport === 'inventory' && reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            data={[reportData.data.filter(item => item.status === 'critical').length,
                   reportData.data.filter(item => item.status === 'low').length,
                   reportData.data.filter(item => item.status === 'normal').length]}
            labels={['Crítico', 'Bajo', 'Normal']}
            title="Distribución de Stock"
            color="red"
          />
          <DonutChart
            data={[reportData.data.filter(item => item.category === 'Electrónica').length,
                   reportData.data.filter(item => item.category === 'Ropa').length,
                   reportData.data.filter(item => item.category === 'Alimentos').length,
                   reportData.data.filter(item => item.category === 'Hogar').length]}
            labels={['Electrónica', 'Ropa', 'Alimentos', 'Hogar']}
            title="Distribución por Categoría"
          />
        </div>
      )}

      {/* Report Type Selector */}
      <div className="bg-[#282837] p-4 rounded-lg shadow border border-[#3a3a4a]">
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeReport === report.id
                    ? 'bg-[#8A2BE2] text-white'
                    : 'bg-[#3a3a4a] text-[#F0F0F0] hover:bg-[#4a4a5a]'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {report.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Table */}
      <ReportsTable
        data={reportData?.data || []}
        columns={reportData?.columns || []}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortConfig={sortConfig}
        itemsPerPage={10}
        totalItems={reportData?.data?.length || 0}
        loading={loading}
      />
    </div>
  );
};

export default PrebuiltReports;