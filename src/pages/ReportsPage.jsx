import React, { useState } from 'react';
import { useReportsChat } from '../hooks/useReportsChat';
import ReportsChatModal from '../components/ReportsChatModal';
import PrebuiltReports from '../features/reports/components/PrebuiltReports';
import ReportsFilters from '../features/reports/components/ReportsFilters';

const ReportsPage = () => {
  const { isChatModalOpen, openChatModal, closeChatModal } = useReportsChat();
  const [filters, setFilters] = useState({
    dateRange: 'this_month',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    storeId: '',
    categoryId: '',
    productType: ''
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: 'this_month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      storeId: '',
      categoryId: '',
      productType: ''
    });
  };

  return (
    <div className="p-6 bg-[#1D1D27]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-[#F0F0F0]">Módulo de Reportes</h1>
          <button
            onClick={openChatModal}
            className="bg-[#8A2BE2] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center border border-[#3a3a4a]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Asistente de Reportes
          </button>
        </div>

        {/* Filters */}
        <ReportsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        {/* Prebuilt Reports */}
        <PrebuiltReports filters={filters} />

        <ReportsChatModal
          isOpen={isChatModalOpen}
          onClose={closeChatModal}
        />
      </div>
    </div>
  );
};

export default ReportsPage;