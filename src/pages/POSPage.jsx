import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Printer,
  FileText,
  Search,
  Package,
  CreditCard,
  UserCircle,
  Zap,
  Percent,
  Calendar,
  X,
  Scan,
  Calculator,
  Maximize,
  Scale,
  Wifi,
  WifiOff,
  BarChart2,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import useAppStore from '../store/useAppStore';
import Ticket from '../features/pos/Ticket';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useZxing } from 'react-zxing';

import EmployeeConsumptionModal from '../features/pos/EmployeeConsumptionModal';
import CalculatorModal from '../features/pos/CalculatorModal';
import TicketDesignModal from '../features/pos/TicketDesignModal';
import DiscountModal from '../features/pos/DiscountModal';
import NoteModal from '../features/pos/NoteModal';
import PaymentModal from '../features/pos/PaymentModal';
import CashClosingModal from '../features/pos/CashClosingModal';
import ProductFormModal from '../features/products/ProductFormModal';
import PreviousSalesModal from '../features/pos/PreviousSalesModal';
import ScheduleVisitModal from '../features/pos/ScheduleVisitModal';
import WithdrawalModal from '../features/pos/WithdrawalModal';
import ProductCollectionModal from '../features/pos/ProductCollectionModal';
import ScannerComponent from '../components/qr/ScannerComponent';
import WeightModal from '../components/WeightModal';
import scaleService from '../services/ScaleService';
import useNotification from '../features/notifications/hooks/useNotification';

// Import the new styled components
import ProductGrid from '../features/pos/components/ProductGrid';
import CartPanel from '../features/pos/components/CartPanel';
import Keypad from '../features/pos/components/Keypad';





export default function POSPage() {
  const {
    currentUser,
    cart,
    searchTerm = '',
    setSearchTerm,
    categories,
    products: productCatalog,
    inventoryBatches,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    handleCheckout,
    lastSale,
    darkMode,
    isOnline,
    offlineMode,
    isWeightModalOpen,
    weighingProduct,
    openWeightModal,
    closeWeightModal,
    addToCartWithWeight,
  } = useAppStore();

  const [isScanning, setIsScanning] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isEmployeeConsumptionModalOpen, setIsEmployeeConsumptionModalOpen] = useState(false);
  const [isTicketDesignModalOpen, setIsTicketDesignModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isCashClosingModalOpen, setIsCashClosingModalOpen] = useState(false);
  const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);
  const [isPreviousSalesModalOpen, setIsPreviousSalesModalOpen] = useState(false);
  const [isScheduleVisitModalOpen, setIsScheduleVisitModalOpen] = useState(false);
  const [postPaymentModalOpen, setPostPaymentModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isProductCollectionModalOpen, setIsProductCollectionModalOpen] = useState(false);

  // State for category filter
  const [currentCategory, setCurrentCategory] = useState('Todo');

  // State for the new keypad functionality
  const [keypadInput, setKeypadInput] = useState('');
  const [selectedCartItem, setSelectedCartItem] = useState(null);

  // Scale status state
  const [scaleStatus, setScaleStatus] = useState('disconnected');
  const [scaleStatusMessage, setScaleStatusMessage] = useState('Scale not connected');

  // Initialize scale status
  useEffect(() => {
    const handleStatusChange = (status, message) => {
      setScaleStatus(status);
      setScaleStatusMessage(message);
    };

    scaleService.addStatusListener(handleStatusChange);

    // Initialize scale status
    if (scaleService.isConnected) {
      setScaleStatus('connected');
      setScaleStatusMessage('Balanza conectada');
    } else {
      setScaleStatus('disconnected');
      setScaleStatusMessage('Balanza no conectada');
    }

    return () => {
      scaleService.removeStatusListener(handleStatusChange);
    };
  }, []);

  const ticketRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Ticket_Venta_${lastSale?.saleId}`,
  });

  const handleSaveTicket = async () => {
    const element = ticketRef.current;
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ticket_venta_${lastSale?.saleId}.pdf`);
    }
    setPostPaymentModalOpen(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const productsForSale = useMemo(() => {
    const storeId = currentUser?.storeId || '1'; // Usar tienda 1 por defecto para fines de prueba
    if (!storeId) {
      console.log("No store ID for current user");
      // Aún así devolver productos para que se muestren en la interfaz
      return productCatalog.map(product => ({
        ...product,
        stockInLocation: process.env.NODE_ENV === 'development' ? 50 : 0, // Stock temporal en desarrollo
        name: product.name || product.nombre || product.productName || 'Producto sin nombre',
        categoryName: categories.find(c =>
          c.id === (product.categoryId || product.category_id)
        )?.name || 'Sin categoría'
      }));
    }

    console.log("storeId:", storeId);
    console.log("inventoryBatches:", inventoryBatches);
    console.log("productCatalog length:", productCatalog.length);

    // Mapear inventario por producto con manejo de ambos formatos de campo
    const stockByProduct = inventoryBatches.reduce((acc, batch) => {
      // Manejar ambos formatos: locationId (camelCase) y location_id (snake_case)
      const batchLocationId = batch.locationId || batch.location_id;

      // Asegurarse de que la comparación sea consistente con tipos de datos
      if (String(batchLocationId) === String(storeId)) {
        // Manejar ambos formatos: productId (camelCase) y product_id (snake_case)
        const productId = batch.productId || batch.product_id;

        // Debug: mostrar detalles de cada batch
        console.log("Batch location match:", {
          batchLocationId,
          storeId,
          productId,
          quantity: batch.quantity
        });

        // Asegurar tipo cadena para la clave del objeto
        acc[String(productId)] = (acc[String(productId)] || 0) + batch.quantity;
      }
      return acc;
    }, {});

    console.log("stockByProduct:", stockByProduct);
    console.log("Products in catalog:", productCatalog.map(p => ({ id: p.id, name: p.name })));

    // Mapear productos del catálogo con información adicional
    // Importante: Ahora mostramos productos del catálogo GENERAL, pero con stock real o desarrollo
    let allCatalogProducts = productCatalog
      .map(product => {
        const calculatedStock = stockByProduct[String(product.id)] || 0;
        return {
          ...product,
          // Mapear campos de categoría asegurando el nombre correcto
          categoryId: product.categoryId || product.category_id,
          // Calcular stock en la ubicación actual (asegurar string para comparación)
          // Si no hay stock registrado, mostrar stock temporal para desarrollo
          stockInLocation: calculatedStock > 0 ? calculatedStock : (process.env.NODE_ENV === 'development' ? 50 : 0),
          // Asegurar que el nombre del producto existe
          name: product.name || product.nombre || product.productName || 'Producto sin nombre',
          // Añadir nombre de categoría si es necesario
          categoryName: categories.find(c =>
            c.id === (product.categoryId || product.category_id)
          )?.name || 'Sin categoría'
        };
      });

    console.log("allCatalogProducts count:", allCatalogProducts.length);

    // Filtrar productos por categoría y búsqueda (asegurar strings para la comparación)
    let productsToShow = allCatalogProducts.filter(
      (product) =>
        String(product.name).toLowerCase().includes(String(searchTerm).toLowerCase()) ||
        String(product.nombre || '').toLowerCase().includes(String(searchTerm).toLowerCase()) ||
        String(product.productName || '').toLowerCase().includes(String(searchTerm).toLowerCase()) ||
        String(product.description || '').toLowerCase().includes(String(searchTerm).toLowerCase())
    );

    // Filtrar por categoría si no es 'Todo'
    if (currentCategory !== 'Todo') {
      productsToShow = productsToShow.filter(product =>
        product.categoryName === currentCategory || product.category === currentCategory
      );
    }

    console.log("productsToShow count:", productsToShow.length);

    return productsToShow;
  }, [productCatalog, inventoryBatches, currentUser, searchTerm, categories, currentCategory]);

  // Show notification when going offline
  React.useEffect(() => {
    const handleOnline = () => {
      alert('Conexión restaurada. Los datos se sincronizarán automáticamente.');
    };

    const handleOffline = () => {
      alert('Sin conexión a Internet. La aplicación está trabajando en modo sin conexión.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleProductSelect = useCallback((product) => {
    // Add product to cart using the existing store function
    addToCart(product);
    // Optionally select the item after adding to cart
    const cartItem = cart.find(item => item.id === product.id);
    if (cartItem) {
      setSelectedCartItem(cartItem);
    }
  }, [addToCart, cart]);

  const handleQuantityChange = useCallback((productId, delta) => {
    const item = cart.find(i => i.id === productId);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta); // Ensure quantity doesn't go below 1
      updateCartItemQuantity(productId, newQty);
    }
  }, [cart, updateCartItemQuantity]);

  const handleRemoveItem = useCallback((productId) => {
    removeFromCart(productId);
    // Deselect if item being removed is selected
    if (selectedCartItem && selectedCartItem.id === productId) {
      setSelectedCartItem(null);
    }
  }, [removeFromCart, selectedCartItem]);

  const handleClearCart = useCallback(() => {
    // Clear the cart using the existing store function
    // Since we don't have a clearCart function in the store, we'll need to remove each item
    cart.forEach(item => removeFromCart(item.id));
    setSelectedCartItem(null);
  }, [cart, removeFromCart]);

  const handleCheckoutClick = useCallback((total) => {
    // Open payment modal with the total
    setIsPaymentMethodModalOpen(true);
  }, []);

  const handlePaymentSuccess = async (payment) => {
    const result = await handleCheckout(payment);

    // Only open the post-payment modal if the checkout was successful
    if (result && result.success !== false) {
      // Handle offline mode result
      if (result.offline) {
        // Show a special message for offline transactions
        alert('Venta procesada en modo sin conexión. Se sincronizará cuando haya conexión a Internet.');
      }

      setIsPaymentMethodModalOpen(false);
      setPostPaymentModalOpen(true); // Open post-payment options modal
    } else {
      // Show error message if checkout failed
      alert('Error al procesar el pago. Por favor inténtelo de nuevo.');
      setIsPaymentMethodModalOpen(false);
    }
  };

  const canAccessEmployeeConsumption = currentUser && (currentUser.role === 'admin' || currentUser.role === 'gerente');

  // Keypad functionality
  const handleNumberInput = useCallback((value) => {
    // Evitar múltiples puntos decimales
    if (value === '.' && keypadInput.includes('.')) return;

    // Evitar que empiece con 0 si ya tiene un valor
    if (keypadInput === '0' && value !== '.') {
      setKeypadInput(value);
      return;
    }

    // Límite de longitud (ej. 8 dígitos)
    if (keypadInput.length >= 8 && value !== '.') return;

    setKeypadInput(prev => prev + value);
  }, [keypadInput]);

  const handleKeypadFunction = useCallback((fnName) => {
    if (fnName === 'clear') {
      setKeypadInput('');
      return;
    }

    if (fnName === 'backspace') {
      setKeypadInput(prev => prev.slice(0, -1));
      return;
    }

    // Las siguientes acciones requieren un ítem seleccionado y una entrada válida
    if (!selectedCartItem) return;

    const numericValue = parseFloat(keypadInput);
    if (isNaN(numericValue) || numericValue <= 0) {
      console.error("Valor de entrada inválido o no positivo.");
      return;
    }

    // Update cart based on function type
    if (fnName === 'set_qty') {
      // Establecer Cantidad
      const newQty = Math.floor(numericValue); // La cantidad debe ser entera
      updateCartItemQuantity(selectedCartItem.id, newQty);
    } else if (fnName === 'set_price') {
      // Cambiar Precio - this would require a new function in the store
      // For now, this functionality would need to be implemented differently
      alert("Cambiar precio no está implementado en este ejemplo");
    }

    // Actualizar la selección y limpiar la entrada
    setKeypadInput('');
  }, [keypadInput, selectedCartItem, updateCartItemQuantity]);

  // If no keypad input, show item quantity
  const displayKeypadInput = useMemo(() => {
    if (keypadInput) return keypadInput;
    if (selectedCartItem) return selectedCartItem.quantity.toString();
    return '';
  }, [keypadInput, selectedCartItem]);

  // Clear keypad input if no item selected
  useEffect(() => {
    if (!selectedCartItem) {
      setKeypadInput('');
    }
  }, [selectedCartItem]);

  // Handle item selection in cart
  const handleItemClick = useCallback((item) => {
    setSelectedCartItem(item);
    setKeypadInput('');
  }, []);

  // Prepare categories for the ProductGrid
  const categoryNames = useMemo(() => {
    // Get unique category names from productsForSale
    const uniqueCategories = [...new Set(productsForSale.map(p => p.categoryName || p.category))];
    return ['Todo', ...uniqueCategories];
  }, [productsForSale]);

  // Calculate cart totals
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 font-sans">
      <h1 className="text-xl font-bold mb-6 text-left text-blue-400 pl-2">
        {currentUser?.storeName || currentUser?.storeId || 'Tienda'}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
        {/* Columna Principal (Izquierda) - Product Grid */}
        <ProductGrid
          products={productsForSale}
          categories={categoryNames}
          currentCategory={currentCategory}
          searchQuery={searchTerm}
          onProductSelect={handleProductSelect}
          onCategoryChange={setCurrentCategory}
          onSearchQueryChange={setSearchTerm}
          onOpenCalculator={() => setIsCalculatorModalOpen(true)}
          onOpenCatalog={() => setIsProductCollectionModalOpen(true)}
          onOpenScanner={() => setIsScanning(true)}
        />

        {/* Columna Lateral (Derecha) */}
        <div className="flex flex-col lg:w-96 w-full space-y-4">
          {/* Módulo CartPanel */}
          <CartPanel
            cart={cart.map(item => ({
              ...item,
              total: item.price * item.quantity
            }))}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckoutClick}
            onItemClick={handleItemClick}
            selectedCartItem={selectedCartItem}
          />

          {/* Botones adicionales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => setIsScheduleVisitModalOpen(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl border border-gray-600 transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              <Calendar size={14}/><span>Agendar</span>
            </button>
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl border border-gray-600 transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              <FileText size={14}/><span>Nota</span>
            </button>
            <button
              onClick={() => setIsDiscountModalOpen(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl border border-gray-600 transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              <Percent size={14}/><span>Descuento</span>
            </button>
            {canAccessEmployeeConsumption && (
              <button
                onClick={() => setIsEmployeeConsumptionModalOpen(true)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl border border-gray-600 transition-colors flex items-center justify-center space-x-1 text-sm"
              >
                <UserCircle size={14}/><span>Consumo</span>
              </button>
            )}
          </div>

          {/* Módulo Keypad */}
          <Keypad
            onNumberInput={handleNumberInput}
            onFunction={handleKeypadFunction}
            keypadInput={displayKeypadInput}
            selectedCartItem={selectedCartItem}
          />
        </div>
      </div>

      {/* Aviso de item seleccionado para el Keypad */}
      {selectedCartItem && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-900/80 backdrop-blur-sm p-2 text-center text-sm font-medium text-white border-t border-blue-600">
          <span className="font-bold">Ítem Seleccionado:</span> {selectedCartItem.name} (Cant: {selectedCartItem.quantity})
        </div>
      )}

      {/* Scanner Modal */}
      {isScanning && (
        <ScannerComponent
          onScan={(scannedBarcode) => {
            if (!scannedBarcode || scannedBarcode.trim() === '') return;
            const product = productsForSale.find(p => p.barcode === scannedBarcode);
            if (product) {
              handleProductSelect(product);
            } else {
              alert(`Producto con código ${scannedBarcode} no encontrado.`);
            }
            setIsScanning(false);
          }}
          onClose={() => setIsScanning(false)}
        />
      )}

        {lastSale && (
          <Modal isOpen={postPaymentModalOpen} onClose={() => setPostPaymentModalOpen(false)} title="Opciones de Ticket">
            <div className="p-4">
              <Ticket saleDetails={lastSale} />
              <div className="flex justify-end space-x-4 mt-4">
                <Button onClick={handlePrint} className="bg-blue-600 text-white hover:bg-blue-700">
                  Imprimir Ticket
                </Button>
                <Button onClick={handleSaveTicket} className="bg-green-600 text-white hover:bg-green-700">
                  Guardar Ticket
                </Button>
                <Button onClick={() => setPostPaymentModalOpen(false)} className="bg-gray-300 hover:bg-gray-400">
                  Cerrar
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {canAccessEmployeeConsumption && (
          <Modal isOpen={isEmployeeConsumptionModalOpen} onClose={() => setIsEmployeeConsumptionModalOpen(false)} title="Registrar Consumo de Empleados">
            <EmployeeConsumptionModal onClose={() => setIsEmployeeConsumptionModalOpen(false)} />
          </Modal>
        )}

        <Modal isOpen={isTicketDesignModalOpen} onClose={() => setIsTicketDesignModalOpen(false)} title="Editar Diseño de Ticket">
          <TicketDesignModal onClose={() => setIsTicketDesignModalOpen(false)} />
        </Modal>

        <Modal isOpen={isCalculatorModalOpen} onClose={() => setIsCalculatorModalOpen(false)} title="Calculadora">
          <CalculatorModal onClose={() => setIsCalculatorModalOpen(false)} />
        </Modal>

        <Modal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} title="Aplicar Descuento">
          <DiscountModal onClose={() => setIsDiscountModalOpen(false)} />
        </Modal>

        <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Añadir Nota a la Venta">
          <NoteModal onClose={() => setIsNoteModalOpen(false)} />
        </Modal>

        <Modal isOpen={isPaymentMethodModalOpen} onClose={() => setIsPaymentMethodModalOpen(false)} title="Procesar Pago">
          <PaymentModal
            onClose={() => setIsPaymentMethodModalOpen(false)}
            onPayment={handlePaymentSuccess}
            total={cartTotal}
          />
        </Modal>

        <Modal isOpen={isCashClosingModalOpen} onClose={() => setIsCashClosingModalOpen(false)} title="Cierre de Caja">
          <CashClosingModal onClose={() => setIsCashClosingModalOpen(false)} />
        </Modal>

        <Modal isOpen={isProductFormModalOpen} onClose={() => setIsProductFormModalOpen(false)} title="Añadir Producto">
          <ProductFormModal onClose={() => setIsProductFormModalOpen(false)} />
        </Modal>

        <Modal isOpen={isPreviousSalesModalOpen} onClose={() => setIsPreviousSalesModalOpen(false)} title="Ventas Anteriores">
          <PreviousSalesModal onClose={() => setIsPreviousSalesModalOpen(false)} />
        </Modal>

        <Modal isOpen={isScheduleVisitModalOpen} onClose={() => setIsScheduleVisitModalOpen(false)} title="Agendar Visita de Proveedor">
          <ScheduleVisitModal onClose={() => setIsScheduleVisitModalOpen(false)} />
        </Modal>

        <Modal isOpen={isWithdrawalModalOpen} onClose={() => setIsWithdrawalModalOpen(false)} title="Retiro de Efectivo">
          <WithdrawalModal onClose={() => setIsWithdrawalModalOpen(false)} />
        </Modal>

        <Modal isOpen={isProductCollectionModalOpen} onClose={() => setIsProductCollectionModalOpen(false)} title="Colección de Productos">
          <ProductCollectionModal onClose={() => setIsProductCollectionModalOpen(false)} />
        </Modal>

        <WeightModal
          isOpen={isWeightModalOpen}
          onClose={closeWeightModal}
          product={weighingProduct}
          onAddToCart={(weight) => {
            addToCartWithWeight(weighingProduct, weight);
            closeWeightModal();
          }}
        />
    </div>
  );
}
