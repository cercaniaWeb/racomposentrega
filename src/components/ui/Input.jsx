import React from 'react';
import PropTypes from 'prop-types';
import useAppStore from '../../store/useAppStore';

const Input = ({ type = 'text', placeholder, value, onChange, className = '', icon: Icon, prefix, ...rest }) => {
  const { darkMode } = useAppStore();

  // Now always uses dark mode styles since toggle is disabled
  const inputClass = `w-full ${Icon ? 'pl-12' : prefix ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-[#404040] rounded-xl focus:ring-2 focus:ring-[#7c4dff] focus:border-[#7c4dff] bg-[#202020] text-[#f5f5f5] transition-all duration-200 shadow-sm focus:shadow-md ${className}`;

  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0a0]";

  const prefixClass = "absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] pl-3";

  return (
    <div className="relative flex items-center">
      {Icon && <Icon className={iconClass} />}
      {prefix && <span className={prefixClass}>{prefix}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClass}
        {...rest}
      />
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.elementType,
  prefix: PropTypes.string
};

export default Input;
