import React from 'react';
import useAppStore from '../../store/useAppStore';

const Sidebar = ({ children, className = '' }) => {
  const { darkMode } = useAppStore(); // Still accessing for compatibility but not using conditionally

  return (
    <aside className={`w-20 bg-[#202020] shadow-card flex flex-col items-center py-4 border-r border-[#333333] ${className}`}>
      {children}
    </aside>
  );
};

export default Sidebar;
