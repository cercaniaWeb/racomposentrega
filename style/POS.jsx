import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  ArrowLeftIcon, 
  PlusIcon, 
  MinusIcon,
  XCircleIcon,
  CheckCircleIcon,
  CalculatorIcon, // Icono para Calculadora
  BookOpenIcon, // Icono para Catálogo
  QrCodeIcon, // Icono para Escáner de Código
} from '@heroicons/react/24/outline';

// --- Interfaces y Tipos ---

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface CartItem extends Product {
  cartId: string;
  quantity: number;
  total: number;
}

interface KeypadProps {
  onNumberInput: (value: string) => void;
  onFunction: (fnName: 'backspace' | 'set_qty' | 'set_price' | 'clear') => void;
  keypadInput: string;
  selectedCartItem: CartItem | null;
}

interface ProductGridProps {
  products: Product[];
  categories: string[];
  currentCategory: string;
  searchQuery: string;
  onProductSelect: (product: Product) => void;
  onCategoryChange: (category: string) => void;
  onSearchQueryChange: (query: string) => void;
}

interface CartPanelProps {
  cart: CartItem[];
  onQuantityChange: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onCheckout: (total: number) => void;
  onItemClick: (item: CartItem) => void;
  selectedCartItem: CartItem | null;
}

// --- MOCK DATA ---

const MOCK_PRODUCTS: Product[] = [
  { id: 'p001', name: 'Leche Entera 1L', category: 'Lácteos', price: 1.55 },
  { id: 'p002', name: 'Pan Integral', category: 'Panadería', price: 2.75 },
  { id: 'p003', name: 'Manzanas Rojas (Kg)', category: 'Frutas y Verduras', price: 3.40 },
  { id: 'p004', name: 'Jugo de Naranja (Galón)', category: 'Bebidas', price: 4.99 },
  { id: 'p005', name: 'Atún en Lata', category: 'Enlatados', price: 1.10 },
  { id: 'p006', name: 'Yogurt Fresa', category: 'Lácteos', price: 0.85 },
  { id: 'p007', name: 'Pan de Molde Blanco', category: 'Panadería', price: 2.10 },
  { id: 'p008', name: 'Papas Fritas (Grande)', category: 'Snacks', price: 1.99 },
  { id: 'p009', name: 'Cerveza Lager (6-pack)', category: 'Bebidas', price: 7.50 },
  { id: 'p010', name: 'Chocolates Oscuros', category: 'Snacks', price: 3.25 },
];

const ALL_CATEGORIES = ['Todo', ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)))];

// --- Subcomponentes ---

/**
 * Módulo: ProductGrid (Cuadrícula de Productos)
 * Columna principal (izquierda), ocupa el espacio flexible (flex-1).
 */
const ProductGrid: React.FC<ProductGridProps> = React.memo(({
  products,
  categories,
  currentCategory,
  searchQuery,
  onProductSelect,
  onCategoryChange,
  onSearchQueryChange,
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
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Buscar o escanear código de barras..."
                className="w-full pl-10 pr-12 py-2 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border border-gray-600 transition duration-150 shadow-inner"
              />

              {/* Botón Escáner (dentro del campo de búsqueda) */}
              <button 
                  onClick={() => console.log('Activar Escáner de Código')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                  title="Escanear Código"
              >
                  <QrCodeIcon className="h-5 w-5" />
              </button>

            </div>
            
            {/* Botones de Herramientas A UN COSTADO */}
            <div className="flex space-x-3 justify-end">
                {/* Botón Calculadora */}
                <button 
                    onClick={() => console.log('Abrir Calculadora')}
                    className={toolButtonClasses}
                    title="Calculadora"
                >
                    <CalculatorIcon className="h-6 w-6" />
                </button>
                {/* Botón Catálogo */}
                <button 
                    onClick={() => console.log('Abrir Catálogo de Precios')}
                    className={toolButtonClasses}
                    title="Catálogo"
                >
                    <BookOpenIcon className="h-6 w-6" />
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
                <span className="text-xs font-light text-gray-400 mb-1">{product.category}</span>
                <span className="text-base font-semibold text-white text-left line-clamp-2 mb-2">
                  {product.name}
                </span>
                <span className="text-xl font-extrabold text-green-400 mt-auto">
                  ${product.price.toFixed(2)}
                </span>
              </button>
            )) : (
              <p className="text-gray-400 col-span-4 text-center py-10">No se encontraron productos.</p>
            )}
          </div>
        </div>
      </div>
    );
});

/**
 * Módulo: CartPanel (Panel del Carrito)
 * Columna lateral (derecha), ancho fijo.
 */
const CartPanel: React.FC<CartPanelProps> = React.memo(({
  cart,
  onQuantityChange,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onItemClick,
  selectedCartItem,
}) => {
  // Lógica Interna: Cálculo de Totales (13% fijo)
  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + item.total, 0);
    const TAX_RATE = 0.13;
    const tax = sub * TAX_RATE;
    const tot = sub + tax;
    return { subtotal: sub, taxAmount: tax, total: tot };
  }, [cart]);

  const cartIsEmpty = cart.length === 0;
  
  // Custom message box state instead of alert()
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  const handleCheckout = () => {
    onCheckout(total);
    setCheckoutTotal(total);
    setShowCheckoutModal(true);
  };

  const handleClearCart = () => {
    // Usamos confirm() para simular, aunque se recomienda un modal personalizado en producción
    if (window.confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
        onClearCart();
    }
  }


  return (
    <div className="flex flex-col bg-gray-800 rounded-xl shadow-lg lg:w-96 w-full p-4 border border-gray-700">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-3">
        <h2 className="text-xl font-bold text-white flex items-center">
          <ShoppingCartIcon className="h-6 w-6 text-blue-400 mr-2" />
          Carrito de Compras
        </h2>
        {/* Usamos un botón de borrar más visible para vaciar el carrito, pero se usará el botón de acción principal */}
        <button 
          onClick={handleClearCart}
          disabled={cartIsEmpty}
          className="text-red-400 hover:text-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Vaciar
        </button>
      </div>

      {/* 1. Lista de Artículos */}
      <div className={`flex-1 overflow-y-auto mb-4 pr-2 ${cartIsEmpty ? 'flex items-center justify-center' : ''}`}>
        {cartIsEmpty ? (
          <p className="text-gray-500 italic">El carrito está vacío.</p>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div 
                key={item.cartId} 
                onClick={() => onItemClick(item)}
                className={`
                  flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                  ${selectedCartItem?.cartId === item.cartId ? 'bg-blue-900 border border-blue-600' : 'bg-gray-700 hover:bg-gray-600'}
                `}
              >
                <div className="flex-1 mr-4">
                  <p className="text-white font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {e.stopPropagation(); onQuantityChange(item.cartId, -1)}}
                    className="p-1 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition"
                    disabled={item.quantity <= 1}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-bold text-green-400 w-16 text-right">${item.total.toFixed(2)}</span>
                  <button 
                    onClick={(e) => {e.stopPropagation(); onQuantityChange(item.cartId, 1)}}
                    className="p-1 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => {e.stopPropagation(); onRemoveItem(item.cartId)}}
                    className="p-1 text-red-400 hover:text-red-300 transition"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Sección de Totales */}
      <div className="space-y-2 py-4 border-t border-gray-700">
        <div className="flex justify-between text-gray-300">
          <span>Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>Impuestos (13%):</span>
          <span className="font-medium">${taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-700">
          <span className="text-2xl font-bold text-white">TOTAL:</span>
          {/* TOTAL destacado */}
          <span className="text-3xl font-extrabold text-green-400">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* 3. Botones de Acción */}
      <div className="flex flex-col space-y-2 mt-4">
        {/* Procesar Cobro (Primario) */}
        <button
          onClick={handleCheckout}
          disabled={cartIsEmpty}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/50 disabled:bg-gray-600 disabled:shadow-none"
        >
          Procesar Cobro
        </button>
        {/* Vaciar Carrito (Secundario/Peligro - ya se maneja con el botón de la cabecera) */}
        <button
          onClick={handleClearCart}
          disabled={cartIsEmpty}
          className="w-full py-2 bg-transparent text-red-400 border border-red-400 font-medium rounded-xl hover:bg-red-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Vaciar Carrito
        </button>
      </div>

      {/* Modal de Pago Exitoso */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border border-gray-700">
            <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">¡Transacción Exitosa!</h3>
            <p className="text-gray-300 mb-6">
              Total pagado: <span className="text-green-400 font-extrabold">${checkoutTotal.toFixed(2)}</span>
            </p>
            <button
              onClick={() => {
                setShowCheckoutModal(false);
                onClearCart();
                setCheckoutTotal(0);
              }}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar y Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * Módulo: Keypad (Teclado Numérico)
 * Debajo del CartPanel en la columna lateral (derecha).
 */
const Keypad: React.FC<KeypadProps> = React.memo(({
  onNumberInput,
  onFunction,
  keypadInput,
  selectedCartItem,
}) => {
  const isItemInCart = !!selectedCartItem;

  const KeypadButton: React.FC<{ value: string; onClick: () => void; className?: string }> = ({ value, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`p-4 text-white text-xl font-semibold rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors shadow-lg ${className}`}
    >
      {value}
    </button>
  );

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg mt-4 border border-gray-700">
      {/* Visualización de Entrada (Integración con App) */}
      <div className="flex items-center justify-between p-3 mb-4 bg-gray-900 rounded-lg border border-gray-700">
        <span className="text-xs text-gray-500">ENTRADA NUMÉRICA</span>
        <span className="text-2xl font-mono text-white tracking-wider">{keypadInput || '0'}</span>
      </div>

      {/* Diseño de Cuadrícula */}
      <div className="grid grid-cols-4 gap-3">
        {/* Fila 1 */}
        <KeypadButton value="7" onClick={() => onNumberInput('7')} />
        <KeypadButton value="8" onClick={() => onNumberInput('8')} />
        <KeypadButton value="9" onClick={() => onNumberInput('9')} />
        
        {/* Borrar (X - Rojo) */}
        <button
          onClick={() => onFunction('backspace')}
          className="p-4 text-red-400 text-xl font-bold rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors shadow-lg"
        >
          <ArrowLeftIcon className="h-6 w-6 mx-auto" />
        </button>

        {/* Fila 2 */}
        <KeypadButton value="4" onClick={() => onNumberInput('4')} />
        <KeypadButton value="5" onClick={() => onNumberInput('5')} />
        <KeypadButton value="6" onClick={() => onNumberInput('6')} />
        
        {/* Acciones Rápidas: Establecer Cantidad (Primario - Azul) */}
        <button
          onClick={() => onFunction('set_qty')}
          disabled={!isItemInCart || keypadInput === ''}
          className={`col-span-1 p-3 text-white text-base font-bold rounded-xl transition-colors shadow-lg
            ${isItemInCart && keypadInput !== '' 
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/50' 
              : 'bg-gray-600 disabled:opacity-50'
            }`}
        >
          Establecer Cant.
        </button>

        {/* Fila 3 */}
        <KeypadButton value="1" onClick={() => onNumberInput('1')} />
        <KeypadButton value="2" onClick={() => onNumberInput('2')} />
        <KeypadButton value="3" onClick={() => onNumberInput('3')} />

        {/* Acciones Rápidas: Cambiar Precio (Secundario - Verde) */}
        <button
          onClick={() => onFunction('set_price')}
          disabled={!isItemInCart || keypadInput === ''}
          className={`col-span-1 p-3 text-white text-base font-bold rounded-xl transition-colors shadow-lg
            ${isItemInCart && keypadInput !== '' 
              ? 'bg-green-600 hover:bg-green-700 shadow-green-500/50' 
              : 'bg-gray-600 disabled:opacity-50'
            }`}
        >
          Cambiar Precio
        </button>

        {/* Fila 4 */}
        <KeypadButton value="0" onClick={() => onNumberInput('0')} className="col-span-2" />
        <KeypadButton value="." onClick={() => onNumberInput('.')} />
        
        {/* Limpiar Entrada */}
        <button
          onClick={() => onFunction('clear')}
          className="p-4 text-yellow-400 text-xl font-bold rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors shadow-lg"
        >
          <XMarkIcon className="h-6 w-6 mx-auto" />
        </button>
      </div>
    </div>
  );
});


/**
 * Componente Principal: App
 * Contiene la lógica de estado y renderiza los tres módulos.
 */
const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('Todo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [keypadInput, setKeypadInput] = useState<string>('');
  const [selectedCartItem, setSelectedCartItem] = useState<CartItem | null>(null);
  const [nextCartId, setNextCartId] = useState<number>(1);
  
  // --- Lógica de Filtrado de Productos ---
  const filteredProducts = useMemo(() => {
    let list = MOCK_PRODUCTS;

    if (currentCategory !== 'Todo') {
      list = list.filter(p => p.category === currentCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // Filtrar por nombre de producto O por ID (simulando búsqueda por código/ID)
      list = list.filter(p => 
        p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query)
      );
    }

    return list;
  }, [currentCategory, searchQuery]);

  // --- Lógica de Manejo de Carrito ---

  const handleProductSelect = useCallback((product: Product) => {
    // 1. Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex(item => item.id === product.id); // Usamos 'id' de Product, no 'productId'

    if (existingItemIndex > -1) {
      // Si existe, incrementar cantidad y seleccionar el ítem
      const updatedCart = cart.map((item, index) => {
        if (index === existingItemIndex) {
          const newQty = item.quantity + 1;
          const updatedItem = {
            ...item,
            quantity: newQty,
            total: newQty * item.price,
          };
          // Seleccionar el ítem después de actualizar
          setSelectedCartItem(updatedItem); 
          return updatedItem;
        }
        return item;
      });
      setCart(updatedCart);
      setKeypadInput(''); // Limpiar entrada al seleccionar/añadir
    } else {
      // Si no existe, añadir nuevo ítem
      const newItem: CartItem = {
        ...product,
        // Mantener solo el 'id' de Product para buscar
        cartId: `c-${nextCartId}`, // Usar cartId para la gestión interna del carrito
        quantity: 1,
        total: product.price,
      };
      setCart(prev => [...prev, newItem]);
      setSelectedCartItem(newItem);
      setNextCartId(prev => prev + 1);
      setKeypadInput(''); // Limpiar entrada al seleccionar/añadir
    }
  }, [cart, nextCartId]);

  const handleQuantityChange = useCallback((cartId: string, delta: number) => {
    setCart(prevCart => prevCart
      .map(item => {
        if (item.cartId === cartId) {
          const newQty = Math.max(1, item.quantity + delta);
          const updatedItem = {
            ...item,
            quantity: newQty,
            total: newQty * item.price,
          };
          // Actualizar la selección si es el ítem seleccionado
          setSelectedCartItem(prev => prev?.cartId === cartId ? updatedItem : prev);
          return updatedItem;
        }
        return item;
      })
      // Eliminar si la cantidad llega a 0, aunque los botones la limitan a 1
      .filter(item => item.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((cartId: string) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    // Deseleccionar si se elimina
    setSelectedCartItem(prev => prev?.cartId === cartId ? null : prev);
    setKeypadInput('');
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
    setSelectedCartItem(null);
    setKeypadInput('');
  }, []);

  const handleCheckout = useCallback((total: number) => {
    console.log(`Procesando cobro por $${total.toFixed(2)}.`);
    // En una aplicación real, aquí se llamaría a la API de pago.
    // El CartPanel manejará la UI de éxito/fracaso.
  }, []);

  // --- Lógica de Manejo de Keypad ---

  const handleNumberInput = useCallback((value: string) => {
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

  const handleKeypadFunction = useCallback((fnName: 'backspace' | 'set_qty' | 'set_price' | 'clear') => {
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

    setCart(prevCart => prevCart.map(item => {
      if (item.cartId === selectedCartItem.cartId) {
        let updatedItem = { ...item };
        
        if (fnName === 'set_qty') {
          // Establecer Cantidad
          const newQty = Math.floor(numericValue); // La cantidad debe ser entera
          updatedItem = {
            ...updatedItem,
            quantity: newQty,
            total: newQty * item.price,
          };
        } else if (fnName === 'set_price') {
          // Cambiar Precio
          updatedItem = {
            ...updatedItem,
            price: numericValue,
            total: item.quantity * numericValue,
          };
        }
        
        // Actualizar la selección y limpiar la entrada
        setSelectedCartItem(updatedItem);
        setKeypadInput('');
        return updatedItem;
      }
      return item;
    }));
    
    // Asegurarse de que el input se limpia y deselecciona después de la acción si la acción ocurrió
    if (fnName === 'set_qty' || fnName === 'set_price') {
        setKeypadInput('');
    }
  }, [keypadInput, selectedCartItem]);

  // Si no hay entrada numérica, mostrar el valor del ítem seleccionado si existe
  const displayKeypadInput = useMemo(() => {
    if (keypadInput) return keypadInput;
    if (selectedCartItem) return selectedCartItem.quantity.toString();
    return '';
  }, [keypadInput, selectedCartItem]);
  
  // Limpiar KeypadInput si se deselecciona el item
  useEffect(() => {
      if (!selectedCartItem) {
          setKeypadInput('');
      }
  }, [selectedCartItem]);

  // Función para seleccionar un ítem del carrito (al hacer clic en CartPanel)
  const handleItemClick = useCallback((item: CartItem) => {
    setSelectedCartItem(item);
    setKeypadInput(''); // Limpiar input al cambiar la selección
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 font-sans">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-400">
        POS Abarrotes <span className="text-white text-base font-medium align-top">v1.0</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
        {/* Columna Principal (Izquierda) - Product Grid */}
        <ProductGrid
          products={filteredProducts}
          categories={ALL_CATEGORIES}
          currentCategory={currentCategory}
          searchQuery={searchQuery}
          onProductSelect={handleProductSelect}
          onCategoryChange={setCurrentCategory}
          onSearchQueryChange={setSearchQuery}
        />

        {/* Columna Lateral (Derecha) */}
        <div className="flex flex-col lg:w-96 w-full space-y-4">
          {/* Módulo CartPanel */}
          <CartPanel
            cart={cart}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            onItemClick={handleItemClick}
            selectedCartItem={selectedCartItem}
          />
          
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
    </div>
  );
};

export default App;
