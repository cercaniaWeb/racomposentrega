import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PrinterIcon, 
  CreditCardIcon, 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import useScrollLock from '../../hooks/useScrollLock';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;

  total: number;
  onCheckout: (paymentData: {method: string, amount?: number}, discount?: number) => Promise<void>;
  isLoading?: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  subtotal, 
 
  total,
  onCheckout,
  isLoading = false
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [customDiscount, setCustomDiscount] = useState<string>('');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Lock/unlock scroll based on modal open state
  useScrollLock(isOpen);

  // Métodos de pago
  const paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Efectivo', icon: CreditCardIcon },
    { id: 'card', name: 'Tarjeta', icon: CreditCardIcon },
    { id: 'qr', name: 'Pago QR', icon: ArrowDownTrayIcon },
    { id: 'transfer', name: 'Transferencia', icon: ArrowDownTrayIcon },
  ];

  useEffect(() => {
    if (isOpen) {
      // Reiniciar estado cuando se abre el modal
      setSelectedPaymentMethod('');
      setDiscount(0);
      setCustomDiscount('');
      setCheckoutStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleDiscountPercentage = (percentage: number) => {
    setDiscount(percentage);
    setCustomDiscount('');
  };

  const handleCustomDiscount = () => {
    if (customDiscount) {
      const discountValue = parseFloat(customDiscount);
      if (!isNaN(discountValue) && discountValue >= 0) {
        setDiscount(discountValue);
      }
    }
  };

  const calculateFinalTotal = () => {
    const discountAmount = total * (discount / 100);
    return total - discountAmount;
  };

  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      setErrorMessage('Por favor selecciona un método de pago');
      return;
    }

    // Si el método de pago es en efectivo, validar que se haya ingresado un monto
    if (selectedPaymentMethod === 'cash') {
      const cashValue = parseFloat(cashAmount) || 0;
      if (cashValue < finalTotal) {
        setErrorMessage(`El monto en efectivo debe ser al menos $${finalTotal.toFixed(2)}`);
        return;
      }
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      let paymentData = { method: selectedPaymentMethod } as any;
      
      if (selectedPaymentMethod === 'cash' && cashAmount) {
        paymentData.amount = parseFloat(cashAmount) || finalTotal;
      }
      
      await onCheckout(paymentData, discount);
      setCheckoutStatus('success');
      
      // Cerrar automáticamente después de un tiempo si es exitoso
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al procesar el cobro');
      setCheckoutStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const finalTotal = calculateFinalTotal();
  const discountAmount = total * (discount / 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
              <CreditCardIcon className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Procesar Pago</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {checkoutStatus === 'idle' && (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Detalles del carrito */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-medium text-white mb-3">Resumen del Pedido</h3>
                  <div className="bg-dark-800 rounded-lg p-4 max-h-60 overflow-y-auto border border-gray-700">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                        <div className="flex-1">
                          <div className="font-medium text-white">{item.productName}</div>
                          <div className="text-sm text-gray-400">
                            {item.quantity} x ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                          </div>
                        </div>
                        <div className="text-white">${typeof item.total === 'number' ? item.total.toFixed(2) : '0.00'}</div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen de totales */}
                  <div className="mt-4 bg-dark-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Subtotal:</span>
                      <span className="text-white">${typeof subtotal === 'number' ? subtotal.toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Impuestos:</span>

                    </div>
                    {typeof discount === 'number' && discount > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Descuento ({discount}%):</span>
                        <span className="text-green-400">-${typeof discountAmount === 'number' ? discountAmount.toFixed(2) : '0.00'}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                      <span className="text-lg font-semibold text-white">Total:</span>
                      <span className="text-xl font-bold text-accent-primary">${typeof finalTotal === 'number' ? finalTotal.toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Panel de cobro */}
                <div className="bg-gray-750 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Pago</h3>

                  {/* Selección de método de pago */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Método de Pago</h4>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`
                            p-3 rounded-lg border text-left transition-colors
                            ${selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }
                          `}
                        >
                          <div className="flex items-center">
                            <method.icon className="h-5 w-5 mr-2" />
                            <span>{method.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errorMessage && selectedPaymentMethod === '' && (
                      <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
                    )}
                  </div>

                  {/* Aplicar descuento */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Aplicar Descuento</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[5, 10, 15, 20].map((percentage) => (
                        <button
                          key={percentage}
                          onClick={() => handleDiscountPercentage(percentage)}
                          className={`
                            px-3 py-1 text-sm rounded border transition-colors
                            ${discount === percentage
                              ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                              : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }
                          `}
                        >
                          {percentage}%
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={customDiscount}
                        onChange={(e) => setCustomDiscount(e.target.value)}
                        placeholder="Descuento personalizado"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleCustomDiscount}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg text-sm transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  {/* Campo de efectivo - Solo visible cuando se selecciona efectivo */}
                  {selectedPaymentMethod === 'cash' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Monto en Efectivo
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                          placeholder={`$${finalTotal.toFixed(2)}`}
                          step="0.01"
                          min={finalTotal}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {cashAmount && (
                          <button
                            onClick={() => setCashAmount('')}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      
                      {/* Quick cash buttons */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {Array.from(new Set([finalTotal, finalTotal + 5, finalTotal + 10, finalTotal + 20, 20, 50, 100, 200])).map((amount, index) => (
                          <button
                            key={`${amount}-${index}`}
                            type="button"
                            onClick={() => setCashAmount(amount.toString())}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-300 rounded-lg text-sm font-medium transition-colors"
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>

                      {/* Display change if cash amount is provided */}
                      {cashAmount && (
                        <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Total a pagar:</span>
                            <span className="font-medium text-white">${finalTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-300">Dado por cliente:</span>
                            <span className="font-medium text-green-400">${parseFloat(cashAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mt-1 pt-2 border-t border-gray-600">
                            <span className="text-gray-300">Cambio:</span>
                            <span className={`font-bold text-lg ${parseFloat(cashAmount) - finalTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${(parseFloat(cashAmount) - finalTotal).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleCheckout}
                      disabled={isProcessing || !selectedPaymentMethod}
                      className={`
                        w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center
                        ${isProcessing || !selectedPaymentMethod
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                        }
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <PrinterIcon className="h-5 w-5 mr-2" />
                          Procesar Pago
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="w-full py-3 px-4 rounded-lg font-medium bg-gray-600 hover:bg-gray-500 text-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        {errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {checkoutStatus === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">¡Pago Exitoso!</h3>
                <p className="text-gray-400 mb-6">
                  La transacción se ha procesado correctamente.
                </p>
                <p className="text-lg font-medium text-blue-400">
                  Total: ${typeof finalTotal === 'number' ? finalTotal.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          )}

          {checkoutStatus === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Error en el Pago</h3>
                <p className="text-gray-400 mb-4">
                  {errorMessage || 'Hubo un problema al procesar la transacción.'}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;