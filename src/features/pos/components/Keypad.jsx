import React from 'react';
import { ArrowLeft, X } from 'lucide-react';

/**
 * Módulo: Keypad (Teclado Numérico)
 * Debajo del CartPanel en la columna lateral (derecha).
 */
const Keypad = React.memo(({
  onNumberInput,
  onFunction,
  keypadInput,
  selectedCartItem,
}) => {
  const isItemInCart = !!selectedCartItem;

  const KeypadButton = ({ value, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`p-4 text-white text-xl font-semibold rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors shadow-lg ${className}`}
    >
      {value}
    </button>
  );

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg mt-4 border border-gray-700">

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
          <ArrowLeft className="h-6 w-6 mx-auto" />
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
          <X className="h-6 w-6 mx-auto" />
        </button>
      </div>
    </div>
  );
});

export default Keypad;