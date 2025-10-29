import React from 'react';
import useAppStore from '../../store/useAppStore';

const Card = ({ children, className = '', header, title, subtitle }) => {
  const { darkMode } = useAppStore();
  
  // Now always uses dark mode styles since toggle is disabled
  const cardClass = `bg-[#202020] border border-[#333333] rounded-xl shadow-card p-6 ${className}`;

  return (
    <div className={cardClass}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className={`font-bold text-[#f5f5f5] text-lg`}>{title}</h3>}
          {subtitle && <p className={`text-sm text-[#a0a0a0]`}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
