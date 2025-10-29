import React, { useState, useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProductFormModal from '../features/products/ProductFormModal';

const InventoryPage = () => {
  const { inventoryBatches, products, stores, categories, deleteProduct } = useAppStore();
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const getProductName = (productId) => products.find(p => p.id === productId)?.name || 'Producto Desconocido';
  const getStoreName = (storeId) => stores.find(s => s.id === storeId)?.name || 'Ubicación Desconocida';
  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.name || 'Sin Categoría';
  const getSubcategoryName = (subcategoryId) => {
    let name = 'Sin Subcategoría';
    categories.forEach(cat => {
      const subCat = cat.subcategories?.find(sub => sub.id === subcategoryId);
      if (subCat) name = subCat.name;
    });
    return name;
  };

  const filteredBatches = useMemo(() => {
    let filtered = inventoryBatches;

    if (locationFilter !== 'all') {
      filtered = filtered.filter(batch => batch.locationId === locationFilter);
    }

    if (categoryFilter !== 'all') {
      const productsInCategory = products.filter(p => p.categoryId === categoryFilter);
      filtered = filtered.filter(batch => productsInCategory.some(p => p.id === batch.productId));
    }

    if (subcategoryFilter !== 'all') {
      const productsInSubcategory = products.filter(p => p.subcategoryId === subcategoryFilter);
      filtered = filtered.filter(batch => productsInSubcategory.some(p => p.id === batch.productId));
    }

    return filtered;
  }, [inventoryBatches, locationFilter, categoryFilter, subcategoryFilter, products]);

  const isDateNearby = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return date > today && date <= thirtyDaysFromNow;
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto del catálogo? Esto no afecta los lotes de inventario existentes.')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="p-6 bg-[#0f0f0f] h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#f5f5f5]">Inventario Detallado por Lote</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={() => handleOpenModal()} variant="primary">
            Añadir/Editar Producto
          </Button>
          <div>
            <label htmlFor="location-filter" className="mr-2 font-medium text-[#c0c0c0]">Filtrar por Ubicación:</label>
            <select 
              id="location-filter"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border border-[#404040] bg-[#202020] text-[#f5f5f5] rounded-xl focus:ring-2 focus:ring-[#7c4dff] focus:border-[#7c4dff] px-3 py-2"
            >
              <option className="bg-[#202020] text-[#f5f5f5]" value="all">Todas las Ubicaciones</option>
              {stores.map(store => (
                <option className="bg-[#202020] text-[#f5f5f5]" key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category-filter" className="mr-2 font-medium text-[#c0c0c0]">Filtrar por Categoría:</label>
            <select 
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSubcategoryFilter('all'); // Reset subcategory filter when category changes
              }}
              className="border border-[#404040] bg-[#202020] text-[#f5f5f5] rounded-xl focus:ring-2 focus:ring-[#7c4dff] focus:border-[#7c4dff] px-3 py-2"
            >
              <option className="bg-[#202020] text-[#f5f5f5]" value="all">Todas las Categorías</option>
              {categories.filter(cat => !cat.parentId).map(cat => (
                <option className="bg-[#202020] text-[#f5f5f5]" key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {categoryFilter !== 'all' && categories.find(cat => cat.id === categoryFilter)?.subcategories.length > 0 && (
            <div>
              <label htmlFor="subcategory-filter" className="mr-2 font-medium text-[#c0c0c0]">Filtrar por Subcategoría:</label>
              <select 
                id="subcategory-filter"
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                className="border border-[#404040] bg-[#202020] text-[#f5f5f5] rounded-xl focus:ring-2 focus:ring-[#7c4dff] focus:border-[#7c4dff] px-3 py-2"
              >
                <option className="bg-[#202020] text-[#f5f5f5]" value="all">Todas las Subcategorías</option>
                {categories.find(cat => cat.id === categoryFilter)?.subcategories.map(subCat => (
                  <option className="bg-[#202020] text-[#f5f5f5]" key={subCat.id} value={subCat.id}>{subCat.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-[#f5f5f5] mb-4">Lotes de Inventario</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#333333]">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Subcategoría</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Costo Unitario</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Fecha de Caducidad</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">ID de Lote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-[#a0a0a0]">No hay lotes de inventario que coincidan con el filtro.</td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const product = products.find(p => p.id === batch.productId);
                  return (
                    <tr key={batch.inventoryId} className={isDateNearby(batch.expirationDate) ? 'bg-[#ffab00]/20' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#f5f5f5]">{getProductName(batch.productId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">{getCategoryName(product?.categoryId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">{getSubcategoryName(product?.subcategoryId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">{getStoreName(batch.locationId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-[#f5f5f5] font-semibold">{batch.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#c0c0c0]">${batch.cost.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDateNearby(batch.expirationDate) ? 'text-[#ffab00] font-bold' : 'text-[#a0a0a0]'}`}>
                        {batch.expirationDate ? new Date(batch.expirationDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a0a0a0] font-mono">{batch.inventoryId}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-[#f5f5f5] mb-4">Catálogo de Productos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#333333]">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Subcategoría</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Precio Unitario</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Precio Mayoreo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Costo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Unidad</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Códigos de Barras</th>
                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {products.map((product, index) => (
                <tr key={product.id} className={`${index % 2 === 0 ? 'bg-[#202020]' : 'bg-[#2c2c2c]'} hover:bg-[#404040] transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#f5f5f5]">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">{getCategoryName(product.categoryId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">{getSubcategoryName(product.subcategoryId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">${product.wholesalePrice ? product.wholesalePrice.toFixed(2) : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">${product.cost ? product.cost.toFixed(2) : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">{product.unitOfMeasure}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">{product.barcodes ? product.barcodes.join(', ') : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button onClick={() => handleOpenModal(product)} variant="outline" className="mr-2">Editar</Button>
                    <Button onClick={() => handleDeleteProduct(product.id)} variant="danger">Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? "Editar Producto" : "Añadir Nuevo Producto"}>
        <ProductFormModal product={editingProduct} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default InventoryPage;
