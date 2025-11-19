import React, { useState, useEffect, useCallback } from 'react';
import { Package, Search, Plus, Edit, Trash2, Filter, BarChart3, Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import ProductForm from '../features/products/ProductForm';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import { useDebounce } from '../hooks/useDebounce';

const PAGE_SIZE = 50;

const ProductsPage = () => {
  const {
    categories,
    stores,
    addProduct,
    updateProduct,
    deleteProduct: deleteProductAPI, // Rename to avoid conflict with local deleteProduct
    inventoryBatches
  } = useAppStore();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const navigate = useNavigate();

  const fetchProducts = useCallback(async (isNewSearch = false) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const currentPage = isNewSearch ? 1 : page;

    try {
      // Get all products from the store
      const allProducts = useAppStore.getState().products;
      const filtered = allProducts.filter(product => {
        const matchesSearch = !debouncedSearchTerm ||
          product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

        const category = categories.find(c => c.id === product.categoryId);
        const matchesCategory = selectedCategory === 'all' ||
          category?.name === selectedCategory;

        // For store filtering, check if product has inventory in the selected store
        let matchesStore = selectedStore === 'all';
        if (selectedStore !== 'all') {
          const storeInventory = inventoryBatches.filter(
            batch => batch.productId === product.id && batch.locationId === selectedStore
          );
          matchesStore = storeInventory.length > 0;
        }

        return matchesSearch && matchesCategory && matchesStore;
      });

      const paginatedProducts = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      );

      setProducts(prev => isNewSearch ? paginatedProducts : [...prev, ...paginatedProducts]);
      setHasMore(currentPage * PAGE_SIZE < filtered.length);
      if (isNewSearch) setPage(2);
      else setPage(prev => prev + 1);

    } catch (err) {
      setError('Error al cargar los productos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearchTerm, isLoading, categories, selectedCategory, selectedStore, inventoryBatches]);

  useEffect(() => {
    fetchProducts(true); // Trigger a new search when debounced search term or filters change
  }, [debouncedSearchTerm, selectedCategory, selectedStore, fetchProducts]);

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId) => {
    setProductToDelete(productId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProductAPI(productToDelete);
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (err) {
      setError('Error al eliminar el producto.');
      console.error(err);
    }
  };

  const handleSaveProduct = (product) => {
    if (product.id) {
      // Update existing product
      updateProduct(product);
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    } else {
      // Add new product
      const newProduct = addProduct(product);
      setProducts(prev => [newProduct, ...prev]);
    }
    setShowProductModal(false);
    setCurrentProduct(null);
  };

  const calculateInventoryByStore = (productId) => {
    const productBatches = inventoryBatches.filter(batch => batch.productId === productId);
    return productBatches.reduce((total, batch) => total + batch.quantity, 0);
  };

  const filteredProducts = products;

  const uniqueCategories = categories.filter(category => 
    products.some(product => product.categoryId === category.id)
  );

  const uniqueStores = stores.filter(store => 
    inventoryBatches.some(batch => 
      batch.productId && batch.locationId === store.id
    )
  );

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#F0F0F0]">Gestión de Productos</h1>
            <p className="text-[#a0a0b0]">Administra los productos de tu inventario</p>
          </div>
          <button
            onClick={() => setShowProductModal(true)}
            className="flex items-center space-x-2 bg-[#8A2BE2] hover:bg-[#7b1fa2] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Producto</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-[#202020] rounded-xl p-6 mb-6 border border-[#3a3a4a]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#2c2c2c] border border-[#3a3a4a] rounded-lg text-[#F0F0F0] focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-[#2c2c2c] border border-[#3a3a4a] rounded-lg text-[#F0F0F0] focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]"
            >
              <option value="all">Todas las categorías</option>
              {uniqueCategories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-4 py-2 bg-[#2c2c2c] border border-[#3a3a4a] rounded-lg text-[#F0F0F0] focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]"
            >
              <option value="all">Todas las sucursales</option>
              {uniqueStores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 flex items-center justify-center p-2 rounded-lg ${
                  viewMode === 'table' 
                    ? 'bg-[#8A2BE2] text-white' 
                    : 'bg-[#2c2c2c] text-[#a0a0b0] hover:bg-[#3a3a4a]'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 flex items-center justify-center p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-[#8A2BE2] text-white' 
                    : 'bg-[#2c2c2c] text-[#a0a0b0] hover:bg-[#3a3a4a]'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-[#202020] rounded-xl border border-[#3a3a4a] overflow-hidden">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2c2c2c]">
                  <tr>
                    <th className="py-3 px-6 text-left text-[#a0a0b0] font-medium">Producto</th>
                    <th className="py-3 px-6 text-left text-[#a0a0b0] font-medium">Categoría</th>
                    <th className="py-3 px-6 text-left text-[#a0a0b0] font-medium">Precio</th>
                    <th className="py-3 px-6 text-left text-[#a0a0b0] font-medium">Costo</th>
                    <th className="py-3 px-6 text-left text-[#a0a0b0] font-medium">SKU</th>
                    <th className="py-3 px-6 text-left text-[#a0a0b0] font-medium">Código de Barras</th>
                    <th className="py-3 px-6 text-left text-[#a0a0b0] font-medium">Unidad</th>
                    <th className="py-3 px-6 text-left text-[#a0a0b0] font-medium">Stock</th>
                    <th className="py-3 px-6 text-left text-[#a0a0b0] font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3a3a4a]">
                  {filteredProducts.map((product) => {
                    const category = categories.find(c => c.id === product.categoryId);
                    const totalInventory = calculateInventoryByStore(product.id);

                    return (
                      <tr key={product.id} className="hover:bg-[#2c2c2c]/50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover mr-3"
                              />
                            ) : (
                              <div className="bg-[#3a3a4a] w-10 h-10 rounded flex items-center justify-center mr-3">
                                <Package className="w-6 h-6 text-[#a0a0b0]" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-[#F0F0F0]">{product.name}</div>
                              <div className="text-sm text-[#a0a0b0] truncate max-w-xs">{product.description || 'Sin descripción'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#F0F0F0]">{category?.name || 'Sin categoría'}</td>
                        <td className="py-4 px-6 text-[#8A2BE2] font-bold">${product.price?.toFixed(2)}</td>
                        <td className="py-4 px-6 text-[#F0F0F0]">${product.cost?.toFixed(2)}</td>
                        <td className="py-4 px-6 text-[#F0F0F0]">{product.sku || 'N/A'}</td>
                        <td className="py-4 px-6 text-[#F0F0F0]">{product.barcode || 'N/A'}</td>
                        <td className="py-4 px-6 text-[#F0F0F0]">{product.unit || 'unidad'}</td>
                        <td className="py-4 px-6 text-[#F0F0F0]">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            totalInventory > 0
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {totalInventory} en stock
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-[#a0a0b0] hover:text-[#8A2BE2] hover:bg-[#3a3a4a] rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-[#a0a0b0] hover:text-red-500 hover:bg-[#3a3a4a] rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            // Grid view
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  const totalInventory = calculateInventoryByStore(product.id);

                  return (
                    <div
                      key={product.id}
                      className="bg-[#1D1D27] border border-[#3a3a4a] rounded-xl p-4 hover:border-[#8A2BE2] transition-colors"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-center mb-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                          ) : (
                            <div className="bg-[#3a3a4a] w-16 h-16 rounded flex items-center justify-center">
                              <Package className="w-8 h-8 text-[#a0a0b0]" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-[#F0F0F0] text-sm mb-1 truncate">{product.name}</h3>
                          <p className="text-xs text-[#a0a0b0] mb-2 truncate">{product.description || 'Sin descripción'}</p>

                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[#8A2BE2] font-bold">${product.price?.toFixed(2)}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              totalInventory > 0
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {totalInventory} en stock
                            </span>
                          </div>

                          <div className="text-xs text-[#a0a0b0] mb-2">
                            <div>Categoría: {category?.name || 'Sin categoría'}</div>
                            <div>SKU: {product.sku || 'N/A'}</div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-[#a0a0b0] hover:text-[#8A2BE2] hover:bg-[#3a3a4a] rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-[#a0a0b0] hover:text-red-500 hover:bg-[#3a3a4a] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-[#a0a0b0] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#F0F0F0] mb-1">No se encontraron productos</h3>
              <p className="text-[#a0a0b0]">Intenta con diferentes filtros de búsqueda</p>
            </div>
          )}
        </div>

        {/* Product Form Modal */}
        {showProductModal && (
          <ProductForm
            product={currentProduct}
            onClose={() => setShowProductModal(false)}
            onSuccess={handleSaveProduct}
            mode="modal"
          />
        )}

        {/* Confirmation Dialog */}
        {showDeleteConfirm && (
          <ConfirmationDialog
            isOpen={showDeleteConfirm}
            title="Eliminar Producto"
            message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
            onConfirm={confirmDeleteProduct}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductsPage;