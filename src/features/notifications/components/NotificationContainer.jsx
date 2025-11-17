import React from 'react';
import useNotificationStore from '../store/useNotificationStore';
import NotificationItem from './NotificationItem';

const NotificationContainer = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const updateNotification = useNotificationStore((state) => state.updateNotification);

  const handleDismiss = (id) => {
    removeNotification(id);
  };

  const handleTogglePersistent = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      // Toggle persistent state
      const newPersistentState = !notification.persistent;
      updateNotification(id, { persistent: newPersistentState });

      // If making persistent, clear the timeout; if making non-persistent, set a new timeout
      if (newPersistentState) {
        // If notification was previously non-persistent with a timeout, we can't cancel it
        // So we just update the state and let the timeout naturally expire if it exists
      } else {
        // Set a default timeout for non-persistent notifications
        setTimeout(() => {
          // Check if notification still exists before removing
          const currentNotifications = useNotificationStore.getState().notifications;
          if (currentNotifications.some(n => n.id === id)) {
            removeNotification(id);
          }
        }, notification.duration || 5000);
      }
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications
        .filter(notification => !notification.persistent)
        .map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              {...notification}
              onDismiss={handleDismiss}
              onTogglePersistent={handleTogglePersistent}
            />
          </div>
        ))}
    </div>
  );
};

export default NotificationContainer;
