
import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useAppStore from '../../store/useAppStore';

const PaymentModal = ({ onClose, onPayment, total }) => {
  const { darkMode } = useAppStore();
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
    <div className={`p-6 ${darkMode ? 'bg-dark-800 text-white' : 'bg-white text-gray-800'} overflow-y-auto max-h-[70vh]`}>
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Procesar Pago</h2>
      
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 ${darkMode ? 'bg-dark-700' : 'dark:from-gray-800 dark:to-gray-800'} rounded-lg p-4 mb-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total a Pagar:</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>${total.toFixed(2)}</p>
        </div>
        
        {/* Comisión en tarjeta */}
        {card > 0 && (
          <div className="mt-2 flex justify-between items-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Comisión de tarjeta:</p>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>${cardCommission.toFixed(2)}</p>
          </div>
        )}
        
        {commissionInCash && (
          <div className="mt-1 flex justify-between items-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>Comisión pagada en efectivo</p>
          </div>
        )}
        
        <div className="mt-2 flex justify-between items-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total con comisión:</p>
          <p className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>${totalWithCommission.toFixed(2)}</p>
        </div>
      </div>

      {/* Payment inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Efectivo</label>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>(${cash.toFixed(2)})</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="0.00"
              className="flex-grow text-lg p-3"
              min="0"
              step="0.01"
            />
            <div className="flex-shrink-0">
              <Button 
                onClick={() => setCash(totalWithCommission - card)} 
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3"
              >
                Total
              </Button>
            </div>
          </div>
          
          {/* Quick cash buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {[10, 20, 50, 100, 200, 500].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setCash(amount)}
                className={`px-3 py-1 ${darkMode ? 'bg-blue-900/30 hover:bg-blue-800/50 text-blue-300' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'} rounded-lg text-sm font-medium transition-colors`}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tarjeta</label>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>(${card.toFixed(2)})</span>
          </div>
          <Input
            type="number"
            value={card}
            onChange={(e) => setCard(e.target.value)}
            placeholder="0.00"
            className="text-lg p-3"
            min="0"
            step="0.01"
          />
          {card > 0 && (
            <div className={`mt-3 p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Comisión (4%): <span className="font-medium">${(card * 0.04).toFixed(2)}</span>
              </p>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="commissionInCash"
                  checked={commissionInCash}
                  onChange={() => setCommissionInCash(!commissionInCash)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="commissionInCash" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Pagar comisión en efectivo
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment summary and validation */}
      <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-4 mb-6`}>
        <div className="flex justify-between mb-2">
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Pagado:</span>
          <span className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>${totalPaid.toFixed(2)}</span>
        </div>
        
        <div className={`flex justify-between mb-2 ${missingAmount > 0 ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-green-400' : 'text-green-600')}`}>
          <span>Faltante:</span>
          <span className="font-medium">${missingAmount.toFixed(2)}</span>
        </div>
        
        {/* Change display */}
        {change >= 0 ? (
          <div className="flex justify-between">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cambio a Devolver:</span>
            <span className={`font-bold text-xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>${change.toFixed(2)}</span>
          </div>
        ) : (
          <div className={`flex justify-between ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            <span>Faltante por pagar:</span>
            <span className="font-bold text-xl">${Math.abs(change).toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button 
          onClick={onClose} 
          variant="outline"
          className={`flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handlePayment} 
          className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex-1 ${darkMode ? 'bg-dark-600' : ''}`}
          disabled={change < 0 || totalPaid < totalWithCommission}
        >
          Confirmar Pago
        </Button>
      </div>
    </div>
  );
};

export default PaymentModal;
