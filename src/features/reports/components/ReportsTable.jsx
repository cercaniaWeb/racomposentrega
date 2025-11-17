import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

const ReportsTable = ({ 
  data = [], 
  columns = [], 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  onSort, 
  sortConfig = null,
  itemsPerPage = 10,
  totalItems = 0,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-[#282837] p-8 rounded-lg shadow border border-[#3a3a4a]">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8A2BE2]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#282837] p-6 rounded-lg shadow border border-[#3a3a4a]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#3a3a4a]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`py-3 px-4 text-left text-sm font-medium text-[#a0a0b0] ${column.className || ''}`}
                  onClick={column.sortable ? () => onSort(column.key) : undefined}
                  style={{ cursor: column.sortable ? 'pointer' : 'default' }}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && (
                      <span className="ml-1">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ?
                            <ChevronUp className="w-4 h-4" /> :
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="border-b border-[#3a3a4a] hover:bg-[#3a3a4a] transition-colors"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="py-3 px-4 text-sm text-[#F0F0F0]">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 px-4 text-center text-[#a0a0b0]">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-[#a0a0b0]">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${currentPage === 1 ? 'text-[#5b5b66] cursor-not-allowed' : 'text-[#a0a0b0] hover:bg-[#3a3a4a]'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm text-[#a0a0b0]">
              {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${currentPage === totalPages ? 'text-[#5b5b66] cursor-not-allowed' : 'text-[#a0a0b0] hover:bg-[#3a3a4a]'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTable;