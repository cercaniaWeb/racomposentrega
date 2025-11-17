import useAppStore from '../../../store/useAppStore';
import useNotification from '../hooks/useNotification';

// Service to check for low stock products and notify users
export const checkLowStockProducts = ({ showWarning, showError, showPersistent } = {}) => {
  const store = useAppStore.getState();

  const { products, inventoryBatches, stores } = store;

  // Track low stock items to avoid duplicate notifications
  const lowStockItems = [];

  // Check each inventory batch against min stock threshold
  inventoryBatches.forEach(batch => {
    const product = products.find(p => p.id === batch.productId);
    if (!product) return; // Skip if product not found

    // Get the min stock threshold for this location
    const minStockThreshold = product.minStockThreshold?.[batch.locationId] ||
                              product.minStockThreshold ||
                              5; // Default to 5 if not set

    // Check if current stock is below threshold
    if (batch.quantity <= minStockThreshold) {
      const storeInfo = stores.find(s => s.id === batch.locationId) || { name: 'Desconocida' };

      lowStockItems.push({
        product: product.name,
        currentStock: batch.quantity,
        minStock: minStockThreshold,
        location: storeInfo.name,
        productId: batch.productId,
        locationId: batch.locationId
      });
    }
  });

  // Show notifications for low stock items if notification functions are provided
  if (showPersistent && lowStockItems.length > 0) {
    // Group by criticality
    const criticalItems = lowStockItems.filter(item => item.currentStock === 0);
    const lowItems = lowStockItems.filter(item => item.currentStock > 0 && item.currentStock <= item.minStock);

    // Show critical stock notification
    if (criticalItems.length > 0) {
      const criticalNames = criticalItems.map(item => item.product).join(', ');
      showPersistent('error', `Productos agotados: ${criticalNames}`, 'Stock Crítico');
    }

    // Show low stock notification
    if (lowItems.length > 0) {
      const lowNames = lowItems.map(item => `${item.product} (${item.currentStock} unidades)`).join(', ');
      showPersistent('warning', `Productos con bajo stock: ${lowNames}`, 'Alerta de Stock');
    }
  }

  return lowStockItems;
};

// Hook to periodically check for low stock
export const useLowStockChecker = () => {
  const { showWarning, showError, showPersistent } = useNotification();
  
  // Function to check low stock and show notifications
  const checkLowStock = () => {
    const lowStockItems = checkLowStockProducts();
    
    // Return summary for UI display
    return {
      totalLowItems: lowStockItems.length,
      criticalItems: lowStockItems.filter(item => item.currentStock === 0),
      lowItems: lowStockItems.filter(item => item.currentStock > 0 && item.currentStock <= item.minStock)
    };
  };
  
  return { checkLowStock };
};

// Function to set up periodic stock checking - this should be called from a component
// where notification functions are available
export const setupPeriodicStockCheck = (notificationFunctions, interval = 300000) => { // Default to every 5 minutes
  // Check immediately
  checkLowStockProducts(notificationFunctions);

  // Set up interval to check periodically
  const intervalId = setInterval(() => {
    checkLowStockProducts(notificationFunctions);
  }, interval);

  // Return function to clear the interval
  return () => clearInterval(intervalId);
};