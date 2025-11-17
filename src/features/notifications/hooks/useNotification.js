import useNotificationStore from '../store/useNotificationStore';

const useNotification = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const addPersistentNotification = useNotificationStore((state) => state.addPersistentNotification);
  const dismissAllPersistent = useNotificationStore((state) => state.dismissAllPersistent);

  return {
    showSuccess: (message, duration, title) => addNotification('success', message, duration, title),
    showError: (message, duration, title) => addNotification('error', message, duration, title),
    showWarning: (message, duration, title) => addNotification('warning', message, duration, title),
    showInfo: (message, duration, title) => addNotification('info', message, duration, title),
    showPersistent: (type, message, title) => addPersistentNotification(type, message, title),
    removeNotification: removeNotification,
    dismissAllPersistent: dismissAllPersistent,
  };
};

export default useNotification;
