import React, { useState, useEffect } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import useAppStore from '../../../store/useAppStore';

const ReportsFilters = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get stores and categories from the global store
  const stores = useAppStore(state => state.stores);
  const categories = useAppStore(state => state.categories);

  const dateRangeOptions = [
    { label: 'Hoy', value: 'today' },
    { label: 'Esta semana', value: 'this_week' },
    { label: 'Este mes', value: 'this_month' },
    { label: 'Últimos 30 días', value: 'last_30_days' },
    { label: 'Este año', value: 'this_year' },
    { label: 'Personalizado', value: 'custom' }
  ];

  const handleDateRangeChange = (range) => {
    let startDate, endDate;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    switch (range) {
      case 'today':
        startDate = startOfDay;
        endDate = endOfDay;
        break;
      case 'this_week':
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startDate = startOfWeek;
        endDate = endOfDay;
        break;
      case 'this_month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        startDate = startOfMonth;
        endDate = endOfMonth;
        break;
      case 'last_30_days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        startDate = new Date(thirtyDaysAgo.setHours(0, 0, 0, 0));
        endDate = endOfDay;
        break;
      case 'this_year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        startDate = startOfYear;
        endDate = endOfYear;
        break;
      default:
        startDate = null;
        endDate = null;
    }

    onFiltersChange({
      ...filters,
      dateRange: range,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : ''
    });
  };

  const handleInputChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-[#282837] p-6 rounded-lg shadow border border-[#3a3a4a] mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#F0F0F0]">Filtros de Reporte</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-[#8A2BE2] hover:text-[#a45df4] text-sm font-medium"
        >
          <Filter className="w-4 h-4 mr-1" />
          {showAdvanced ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#a0a0b0] mb-2">Rango de fechas</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full p-2 border border-[#3a3a4a] rounded-md focus:ring-[#8A2BE2] focus:border-[#8A2BE2] bg-[#1D1D27] text-[#F0F0F0]"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {filters.dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-2">Fecha inicio</label>
                <input
                  type="date"
                  value={formatDate(filters.startDate)}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full p-2 border border-[#3a3a4a] rounded-md focus:ring-[#8A2BE2] focus:border-[#8A2BE2] bg-[#1D1D27] text-[#F0F0F0]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a0a0b0] mb-2">Fecha fin</label>
                <input
                  type="date"
                  value={formatDate(filters.endDate)}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full p-2 border border-[#3a3a4a] rounded-md focus:ring-[#8A2BE2] focus:border-[#8A2BE2] bg-[#1D1D27] text-[#F0F0F0]"
                />
              </div>
            </>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#3a3a4a]">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-2">Tienda</label>
              <select
                value={filters.storeId || ''}
                onChange={(e) => handleInputChange('storeId', e.target.value)}
                className="w-full p-2 border border-[#3a3a4a] rounded-md focus:ring-[#8A2BE2] focus:border-[#8A2BE2] bg-[#1D1D27] text-[#F0F0F0]"
              >
                <option value="">Todas las tiendas</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-2">Categoría</label>
              <select
                value={filters.categoryId || ''}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="w-full p-2 border border-[#3a3a4a] rounded-md focus:ring-[#8A2BE2] focus:border-[#8A2BE2] bg-[#1D1D27] text-[#F0F0F0]"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-2">Tipo de producto</label>
              <select
                value={filters.productType || ''}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                className="w-full p-2 border border-[#3a3a4a] rounded-md focus:ring-[#8A2BE2] focus:border-[#8A2BE2] bg-[#1D1D27] text-[#F0F0F0]"
              >
                <option value="">Todos los tipos</option>
                <option value="physical">Físico</option>
                <option value="digital">Digital</option>
                <option value="service">Servicio</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.dateRange && filters.dateRange !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#1D1D27] text-[#8A2BE2] border border-[#8A2BE2]">
              {dateRangeOptions.find(opt => opt.value === filters.dateRange)?.label}
              <button
                onClick={() => handleDateRangeChange('all')}
                className="ml-2 text-[#8A2BE2] hover:text-[#a45df4]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.storeId && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#1D1D27] text-green-400 border border-green-400">
              Tienda: {stores.find(s => s.id === filters.storeId)?.name}
              <button
                onClick={() => handleInputChange('storeId', '')}
                className="ml-2 text-green-400 hover:text-green-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.categoryId && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#1D1D27] text-purple-400 border border-purple-400">
              Categoría: {categories.find(c => c.id === filters.categoryId)?.name}
              <button
                onClick={() => handleInputChange('categoryId', '')}
                className="ml-2 text-purple-400 hover:text-purple-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.productType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#1D1D27] text-yellow-400 border border-yellow-400">
              Tipo: {filters.productType}
              <button
                onClick={() => handleInputChange('productType', '')}
                className="ml-2 text-yellow-400 hover:text-yellow-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-[#a0a0b0] bg-[#3a3a4a] rounded-md hover:bg-[#4a4a5a] transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilters;