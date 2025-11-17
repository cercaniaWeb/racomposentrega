import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Pin, PinOff } from 'lucide-react';

/**
 * @typedef {import('../../types').Notification} Notification
 */

const NotificationItem = ({ id, type, message, title, persistent, onDismiss, onTogglePersistent }) => {
  let bgColor, textColor, borderColor, IconComponent;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      textColor = 'text-white';
      borderColor = 'border-green-600';
      IconComponent = CheckCircle;
      break;
    case 'error':
      bgColor = 'bg-red-500';
      textColor = 'text-white';
      borderColor = 'border-red-600';
      IconComponent = XCircle;
      break;
    case 'warning':
      bgColor = 'bg-yellow-400';
      textColor = 'text-gray-800'; // Changed for better contrast
      borderColor = 'border-yellow-500';
      IconComponent = AlertTriangle;
      break;
    case 'info':
      bgColor = 'bg-blue-500';
      textColor = 'text-white';
      borderColor = 'border-blue-600';
      IconComponent = Info;
      break;
    default:
      bgColor = 'bg-gray-700';
      textColor = 'text-white';
      borderColor = 'border-gray-800';
      IconComponent = Info;
  }

  return (
    <div
      className={`${bgColor} ${borderColor} border p-4 rounded-lg shadow-lg flex items-start space-x-3 transition-all duration-300 ease-out animate-in slide-in-from-right max-w-sm`}
      role="alert"
    >
      {IconComponent && <IconComponent className={`h-5 w-5 ${textColor} flex-shrink-0 mt-0.5`} />}
      <div className="flex-grow min-w-0">
        {title && <p className={`text-sm font-semibold ${textColor} mb-1`}>{title}</p>}
        <p className={`text-sm ${textColor}`}>{message}</p>
      </div>
      <div className="flex flex-col space-y-1">
        {onTogglePersistent && (
          <button
            onClick={() => onTogglePersistent(id)}
            className={`p-1 rounded-full ${textColor} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            aria-label={persistent ? "Desanclar notificación" : "Anclar notificación"}
          >
            {persistent ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </button>
        )}
        <button
          onClick={() => onDismiss(id)}
          className={`p-1 rounded-full ${textColor} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
          aria-label="Cerrar notificación"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

NotificationItem.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  persistent: PropTypes.bool,
  onDismiss: PropTypes.func.isRequired,
  onTogglePersistent: PropTypes.func,
};

export default NotificationItem;
