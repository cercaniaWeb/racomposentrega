
import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Building, ShoppingCart, List, DollarSign, Calendar, MessageSquare } from 'lucide-react';

const ScheduleVisitModal = ({ onClose }) => {
  const [provider, setProvider] = useState('');
  const [purchaseOrder, setPurchaseOrder] = useState('');
  const [items, setItems] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSchedule = () => {
    // Logic to schedule the visit
    onClose();
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-white">Agendar Visita de Proveedor</h2>
      <div className="space-y-4">
        <Input icon={Building} label="Nombre del Proveedor" placeholder="Ej: Coca-Cola" value={provider} onChange={(e) => setProvider(e.target.value)} />
        <Input icon={ShoppingCart} label="Número de Orden de Compra" placeholder="Ej: OC-12345" value={purchaseOrder} onChange={(e) => setPurchaseOrder(e.target.value)} />
        <Input icon={List} label="Artículos a Recibir" placeholder="Ej: 24-pack Coca-Cola, 12-pack Sprite" value={items} onChange={(e) => setItems(e.target.value)} />
        <Input icon={DollarSign} label="Monto a Pagar (Estimado)" type="number" placeholder="Ej: 1500.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input icon={Calendar} label="Fecha de Visita" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Notas Adicionales</label>
          <div className="relative rounded-md shadow-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: El proveedor llegará por la tarde."
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={onClose} className="bg-gray-600 text-white hover:bg-gray-500">
          Cancelar
        </Button>
        <Button onClick={handleSchedule} className="bg-blue-600 text-white hover:bg-blue-700">
          Agendar Visita
        </Button>
      </div>
    </div>
  );
};

export default ScheduleVisitModal;
