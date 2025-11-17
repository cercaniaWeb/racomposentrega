import React from 'react';
import PropTypes from 'prop-types';

const Select = ({ children, className, ...props }) => {
  return (
    <select
      className={`w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

Select.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default Select;
