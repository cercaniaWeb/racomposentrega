import React from 'react';
import PropTypes from 'prop-types';
import useAppStore from '../../store/useAppStore';

const Button = ({ children, onClick, className = '', variant = 'primary', size = 'md', disabled = false }) => {
  const { darkMode } = useAppStore();
  
  // Tamaños
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-xl',
  };
  
  // Define button variants - now always uses dark mode styles
  const getButtonClass = () => {
    let baseClass = `${sizeClasses[size]} font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 `;
    
    if (disabled) {
      baseClass += 'opacity-50 cursor-not-allowed ';
    } else {
      baseClass += 'cursor-pointer hover:opacity-90 active:scale-[0.98] ';
    }
    
    switch (variant) {
      case 'primary':
        return baseClass + 'bg-[#7c4dff] text-white hover:bg-[#5b2ecb] shadow-card ' + className;
      case 'secondary':
        return baseClass + 'bg-[#2c2c2c] text-[#c0c0c0] border border-[#404040] hover:bg-[#404040] shadow-card ' + className;
      case 'success':
        return baseClass + 'bg-[#00c853] text-white hover:bg-[#00a844] shadow-card ' + className;
      case 'danger':
        return baseClass + 'bg-[#ff5252] text-white hover:bg-[#e04040] shadow-card ' + className;
      case 'outline':
        return baseClass + 'bg-transparent border border-[#7c4dff] text-[#7c4dff] hover:bg-[#7c4dff]/10 shadow-card ' + className;
      case 'ghost':
        return baseClass + 'bg-transparent text-[#c0c0c0] hover:bg-[#2c2c2c] ' + className;
      default:
        return baseClass + className;
    }
  };

  return (
    <button
      onClick={onClick}
      className={getButtonClass()}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'outline', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool
};

export default Button;
