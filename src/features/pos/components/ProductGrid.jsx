import React from 'react';
import { Search, QrCode, Calculator, BookOpen } from 'lucide-react';

/**
 * Módulo: ProductGrid (Cuadrícula de Productos)
 * Columna principal (izquierda), ocupa el espacio flexible (flex-1).
 */
const ProductGrid = React.memo(({
  products,
  categories,
  currentCategory,
  searchQuery,
  onProductSelect,
  onCategoryChange,
  onSearchQueryChange,
  onOpenCalculator,
  onOpenCatalog,
  onOpenScanner
}) => {
  // Clases de utilidad para los botones de la barra de búsqueda
  const toolButtonClasses = "p-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-colors flex-shrink-0 shadow-lg border border-gray-600";

  return (
    <div className="flex flex-col bg-gray-800 p-4 rounded-xl shadow-lg flex-1 h-full border border-gray-700">
      <div className="mb-4">
        {/* Bloque de Búsqueda y Botones de Herramientas */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* 1. Búsqueda y Escáner (integrados) */}
          <div className="relative flex-1 flex items-center"> {/* Agregamos flex items-center para alinear el botón del escáner */}

            {/* Icono de Lupa a la izquierda del input */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Buscar o escanear código de barras..."
              className="w-full pl-10 pr-12 py-2 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border border-gray-600 transition duration-150 shadow-inner"
            />

            {/* Botón Escáner (dentro del campo de búsqueda) */}
            <button
              onClick={onOpenScanner}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
              title="Escanear Código"
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>

          {/* Botones de Herramientas A UN COSTADO */}
          <div className="flex space-x-3 justify-end">
            {/* Botón Calculadora */}
            <button
              onClick={onOpenCalculator}
              className={toolButtonClasses}
              title="Calculadora"
            >
              <Calculator className="h-6 w-6" />
            </button>
            {/* Botón Catálogo */}
            <button
              onClick={onOpenCatalog}
              className={toolButtonClasses}
              title="Catálogo"
            >
              <BookOpen className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 2. Filtrado por Categoría (Píldora) */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                px-4 py-1 text-sm font-medium rounded-full transition-colors duration-200 whitespace-nowrap
                ${currentCategory === category
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/50'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tarjetas de Producto */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.length > 0 ? products.map(product => (
            <button
              key={product.id}
              onClick={() => onProductSelect(product)}
              className="flex flex-col items-start p-3 bg-gray-700 rounded-xl shadow-lg hover:bg-gray-600 transition-transform duration-150 transform hover:scale-[1.02] border border-gray-600"
            >
              <span className="text-xs font-light text-gray-400 mb-1">{product.categoryName || product.category || 'Sin categoría'}</span>
              <span className="text-base font-semibold text-white text-left line-clamp-2 mb-2">
                {product.name}
              </span>
              <div className="flex flex-col w-full">
                <span className="text-xl font-extrabold text-green-400">
                  ${product.price.toFixed(2)}
                </span>
                <span className={`text-xs mt-1 ${
                  (product.stockInLocation || 0) > 5 ? 'text-green-400' :
                  (product.stockInLocation || 0) > 0 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  Stock: {product.stockInLocation || 0}
                </span>
              </div>
            </button>
          )) : (
            <p className="text-gray-400 col-span-4 text-center py-10">No se encontraron productos.</p>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductGrid;