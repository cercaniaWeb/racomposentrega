import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';

const PaymentModal = ({ onClose, onPayment, total }) => {
  const darkMode = useAppStore((state) => state.darkMode);
  const [cash, setCash] = useState(0);
  const [card, setCard] = useState(0);
  const [commissionInCash, setCommissionInCash] = useState(false);
  const [change, setChange] = useState(0);

  const cardCommission = card > 0 ? card * 0.04 : 0;
  const totalWithCommission = total + (commissionInCash ? 0 : cardCommission);

  useEffect(() => {
    const totalPaid = Number(cash) + Number(card);
    const newChange = totalPaid - totalWithCommission;
    setChange(newChange);
  }, [cash, card, totalWithCommission]);

  const handlePayment = () => {
    onPayment({ cash, card, cardCommission, commissionInCash });
  };

  // Calculate amounts
  const totalPaid = Number(cash) + Number(card);
  const missingAmount = Math.max(0, totalWithCommission - totalPaid);

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} text-white overflow-y-auto max-h-[70vh] bg-gray-800`}>
      <h2 className="text-2xl font-bold mb-6 text-white">Procesar Pago</h2>

      <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-gray-300">Total a Pagar:</p>
          <p className="text-2xl font-bold text-green-400">${total.toFixed(2)}</p>
        </div>

        {/* Comisión en tarjeta */}
        {card > 0 && (
          <div className="mt-2 flex justify-between items-center">
            <p className="text-sm text-gray-400">Comisión de tarjeta:</p>
            <p className="text-sm font-medium text-gray-300">${cardCommission.toFixed(2)}</p>
          </div>
        )}

        {commissionInCash && (
          <div className="mt-1 flex justify-between items-center">
            <p className="text-sm text-gray-400 italic">Comisión pagada en efectivo</p>
          </div>
        )}

        <div className="mt-2 flex justify-between items-center">
          <p className="text-sm text-gray-400">Total con comisión:</p>
          <p className="text-lg font-bold text-gray-200">${totalWithCommission.toFixed(2)}</p>
        </div>
      </div>

      {/* Payment inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-300">Efectivo</label>
            <span className="text-sm font-medium text-gray-400">(${cash.toFixed(2)})</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="0.00"
              className="w-full pl-4 pr-4 py-3 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border border-gray-600 transition duration-150 shadow-inner"
              min="0"
              step="0.01"
            />
            <div className="flex-shrink-0">
              <button
                onClick={() => setCash(totalWithCommission - card)}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-3 rounded-xl border border-gray-500"
              >
                Total
              </button>
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="mt-4">
            <div className="text-center mb-2 text-white font-mono text-xl tracking-wider bg-gray-700 py-2 rounded-lg">
              ${cash || '0.00'}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.', 'C'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') {
                      setCash(0);
                    } else if (key === '.') {
                      if (!cash.toString().includes('.')) {
                        setCash(cash ? parseFloat(cash + '.') : '0.');
                      }
                    } else {
                      const newValue = cash ? parseFloat(`${cash}${key}`) : parseFloat(key);
                      setCash(newValue);
                    }
                  }}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-colors text-center"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-300">Tarjeta</label>
            <span className="text-sm font-medium text-gray-400">(${card.toFixed(2)})</span>
          </div>
          <input
            type="number"
            value={card}
            onChange={(e) => setCard(e.target.value)}
            placeholder="0.00"
            className="w-full pl-4 pr-4 py-3 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border border-gray-600 transition duration-150 shadow-inner"
            min="0"
            step="0.01"
          />
          {card > 0 && (
            <div className="mt-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">
                Comisión (4%): <span className="font-medium">${(card * 0.04).toFixed(2)}</span>
              </p>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="commissionInCash"
                  checked={commissionInCash}
                  onChange={() => setCommissionInCash(!commissionInCash)}
                  className="h-4 w-4 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                />
                <label htmlFor="commissionInCash" className="ml-2 block text-sm text-gray-300">
                  Pagar comisión en efectivo
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment summary and validation */}
      <div className="border-t border-gray-700 pt-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Total Pagado:</span>
          <span className="text-gray-200 font-medium">${totalPaid.toFixed(2)}</span>
        </div>

        <div className={`flex justify-between mb-2 ${missingAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
          <span>Faltante:</span>
          <span className="font-medium">${missingAmount.toFixed(2)}</span>
        </div>

        {/* Change display */}
        {change >= 0 ? (
          <div className="flex justify-between">
            <span className="text-gray-400">Cambio a Devolver:</span>
            <span className="font-bold text-xl text-green-400">${change.toFixed(2)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-red-400">
            <span>Faltante por pagar:</span>
            <span className="font-bold text-xl">${Math.abs(change).toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl border border-gray-500 font-medium transition-colors flex-1"
        >
          Cancelar
        </button>
        <button
          onClick={handlePayment}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex-1 shadow-lg shadow-blue-500/50"
          disabled={change < 0 || totalPaid < totalWithCommission}
        >
          Confirmar Pago
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;