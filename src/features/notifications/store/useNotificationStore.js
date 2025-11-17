import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Default durations for different notification types
const DEFAULT_DURATIONS = {
  info: 5000,      // 5 seconds
  success: 5000,   // 5 seconds
  warning: 8000,   // 8 seconds
  error: 10000,    // 10 seconds
  persistent: 0    // 0 means persistent (no auto-removal)
};

const useNotificationStore = create((set, get) => ({
  notifications: [],

  addNotification: (type, message, duration = null, title = null, persistent = false) => {
    const id = uuidv4();

    // Determine duration based on type if not explicitly provided
    const finalDuration = duration !== null ? duration :
                         persistent ? 0 :
                         DEFAULT_DURATIONS[type] || DEFAULT_DURATIONS.info;

    const newNotification = {
      id,
      type,
      message,
      duration: finalDuration,
      title: title || capitalizeFirstLetter(type),
      persistent: persistent || finalDuration === 0,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Only set auto-removal timer if duration is not 0 (persistent)
    if (finalDuration > 0) {
      setTimeout(() => {
        // Check if notification still exists before removing
        const currentNotifications = get().notifications;
        if (currentNotifications.some(n => n.id === id)) {
          get().removeNotification(id);
        }
      }, finalDuration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  // New method to update notification
  updateNotification: (id, updates) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === id ? { ...notification, ...updates } : notification
      )
    }));
  },

  // New method to add persistent notification
  addPersistentNotification: (type, message, title = null) => {
    get().addNotification(type, message, 0, title, true);
  },

  // New method to dismiss all persistent notifications
  dismissAllPersistent: () => {
    set((state) => ({
      notifications: state.notifications.filter(notification => !notification.persistent)
    }));
  }
}));

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default useNotificationStore;
