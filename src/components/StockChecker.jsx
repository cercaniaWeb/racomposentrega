import { useEffect } from 'react';
import { setupPeriodicStockCheck } from '../features/notifications/services/lowStockService';
import useNotification from '../features/notifications/hooks/useNotification';

const StockChecker = () => {
  const { showWarning, showError, showPersistent } = useNotification();

  useEffect(() => {
    // Set up periodic stock checking (every 5 minutes)
    const notificationFunctions = { showWarning, showError, showPersistent };
    const cleanupStockCheck = setupPeriodicStockCheck(notificationFunctions, 300000);

    // Cleanup function
    return () => {
      if (cleanupStockCheck) {
        cleanupStockCheck();
      }
    };
  }, [showWarning, showError, showPersistent]);

  // This component doesn't render anything, it just runs the side effect
  return null;
};

export default StockChecker;