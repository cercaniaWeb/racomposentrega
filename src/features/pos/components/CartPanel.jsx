import React, { useMemo } from 'react';
import { ShoppingCart, Plus, Minus, XCircle, CheckCircle } from 'lucide-react';

/**
 * Módulo: CartPanel (Panel del Carrito)
 * Columna lateral (derecha), ancho fijo.
 */
const CartPanel = React.memo(({
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

  const handleCheckout = () => {
    onCheckout(total);
  };

  const handleClearCart = () => {
    // Usamos confirm() para simular, aunque se recomienda un modal personalizado en producción
    if (window.confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      onClearCart();
    }
  };

  return (
    <div className="flex flex-col bg-gray-800 rounded-xl shadow-lg lg:w-96 w-full p-4 border border-gray-700">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-3">
        <h2 className="text-xl font-bold text-white flex items-center">
          <ShoppingCart className="h-6 w-6 text-blue-400 mr-2" />
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
                key={item.id || item.cartId}
                onClick={() => onItemClick(item)}
                className={`
                  flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                  ${selectedCartItem?.id === item.id || selectedCartItem?.cartId === item.cartId ? 'bg-blue-900 border border-blue-600' : 'bg-gray-700 hover:bg-gray-600'}
                `}
              >
                <div className="flex-1 mr-4">
                  <p className="text-white font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {e.stopPropagation(); onQuantityChange(item.id || item.cartId, -1)}}
                    className="p-1 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-bold text-green-400 w-16 text-right">${item.total.toFixed(2)}</span>
                  <button
                    onClick={(e) => {e.stopPropagation(); onQuantityChange(item.id || item.cartId, 1)}}
                    className="p-1 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {e.stopPropagation(); onRemoveItem(item.id || item.cartId)}}
                    className="p-1 text-red-400 hover:text-red-300 transition"
                  >
                    <XCircle className="h-5 w-5" />
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
    </div>
  );
});

export default CartPanel;