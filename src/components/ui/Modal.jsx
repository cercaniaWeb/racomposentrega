import React from 'react';
import { X } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const Modal = ({ isOpen, onClose, title, children }) => {
  const { darkMode } = useAppStore(); // Still accessing for compatibility but not using conditionally
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#202020] text-[#f5f5f5] rounded-xl shadow-card p-6 w-full max-w-md mx-auto transition-all duration-200 border border-[#333333]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#f5f5f5]">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-[#404040] text-[#c0c0c0]"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
