import { getSalesForCategory, getInventoryReport, getSalesComparison } from '../../../lib/query-functions';
import useAppStore from '../../../store/useAppStore';

// Service to fetch different types of reports
export const fetchReportData = async (reportType, filters) => {
  // Format date range from filters
  const dateRange = {
    startDate: filters.startDate || new Date().toISOString().split('T')[0],
    endDate: filters.endDate || new Date().toISOString().toISOString().split('T')[0]
  };

  try {
    switch (reportType) {
      case 'sales-summary':
        // For sales summary, we'll get sales data for the specified date range
        const salesData = await getSalesForCategory(null, dateRange);
        return formatSalesSummaryData(salesData);

      case 'top-products':
        // For top products, we'll need to aggregate sales data by product
        const topProductsData = await getSalesForCategory(null, dateRange);
        return formatTopProductsData(topProductsData);

      case 'inventory':
        // For inventory, we'll get inventory data from the store
        const store = useAppStore.getState();
        return formatInventoryDataFromStore(store, filters);

      case 'sales-comparison':
        // For sales comparison, we'll compare current period with previous
        const previousDateRange = {
          startDate: calculatePreviousPeriod(dateRange.startDate, dateRange.endDate).startDate,
          endDate: calculatePreviousPeriod(dateRange.startDate, dateRange.endDate).endDate
        };

        const currentPeriodData = await getSalesForCategory(
          filters.categoryId ? { id: filters.categoryId } : null,
          dateRange
        );

        const previousPeriodData = await getSalesForCategory(
          filters.categoryId ? { id: filters.categoryId } : null,
          previousDateRange
        );

        return formatSalesComparisonData(currentPeriodData, previousPeriodData);

      default:
        return { data: [], columns: [] };
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw error;
  }
};

// Helper function to format inventory data from store state
const formatInventoryDataFromStore = (store, filters) => {
  const { products, categories, inventoryBatches, stores } = store;

  // Filter inventory based on store and category filters
  let filteredBatches = inventoryBatches;

  if (filters.storeId) {
    filteredBatches = filteredBatches.filter(batch => batch.locationId === filters.storeId);
  }

  // Combine product info with inventory batches
  const inventoryByLocation = filteredBatches.map(batch => {
    const product = products.find(p => p.id === batch.productId) || {};
    const category = categories.find(c => c.id === product.categoryId) || {};
    const storeInfo = stores.find(s => s.id === batch.locationId) || { name: batch.locationId };

    return {
      ...batch,
      productName: product.name || 'Producto Desconocido',
      productCategory: category.name || 'Sin Categoría',
      productPrice: product.price || 0,
      minStockThreshold: product.minStockThreshold?.[batch.locationId] || product.minStockThreshold || 5,
      locationName: storeInfo.name || batch.locationId,
      productSku: product.sku || '',
      barcode: product.barcode || '',
      expirationDate: batch.expirationDate || null
    };
  });

  // Group inventory by product to show aggregated views
  const groupedInventory = {};
  inventoryByLocation.forEach(item => {
    const key = `${item.productId}-${item.locationId}`;
    if (!groupedInventory[key]) {
      groupedInventory[key] = {
        ...item,
        totalQuantity: 0,
        batches: []
      };
    }
    groupedInventory[key].totalQuantity += item.quantity;
    groupedInventory[key].batches.push(item);
  });

  const inventoryGroups = Object.values(groupedInventory);

  // Format data for the table
  const data = inventoryGroups.map((item, index) => {
    // Calculate status based on minStockThreshold
    let status = 'normal';
    if (item.totalQuantity <= 0) {
      status = 'critical';
    } else if (item.totalQuantity <= (item.minStockThreshold || 5)) {
      status = 'low';
    }

    return {
      id: index + 1,
      name: item.productName,
      category: item.productCategory,
      stock: item.totalQuantity || 0,
      minStock: item.minStockThreshold || 5,
      status: status,
      unit: item.unit || 'unidad',
      location: item.locationName,
      sku: item.productSku
    };
  });

  const columns = [
    { key: 'name', label: 'Producto', sortable: true },
    { key: 'category', label: 'Categoría', sortable: true },
    { key: 'location', label: 'Ubicación', sortable: true },
    { key: 'stock', label: 'Stock Actual', sortable: true },
    { key: 'minStock', label: 'Stock Mínimo', sortable: true },
    { key: 'unit', label: 'Unidad', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      renderer: 'statusBadge' // Use a special renderer type instead of inline JSX
    }
  ];

  return { data, columns };
};

// Helper function to calculate previous period dates
const calculatePreviousPeriod = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate the difference in days
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate previous period
  const prevEnd = new Date(start);
  prevEnd.setDate(start.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - diffDays + 1);
  
  return {
    startDate: prevStart.toISOString().split('T')[0],
    endDate: prevEnd.toISOString().split('T')[0]
  };
};

// Helper functions to format data for each report type
const formatSalesSummaryData = (salesData) => {
  // This is a simplified version - in a real implementation, you'd want to group by date
  const data = [
    {
      id: 1,
      date: salesData.dateRange?.startDate || new Date().toISOString().split('T')[0],
      total: salesData.totalSales || 0,
      transactions: salesData.transactionCount || 0,
      products: salesData.itemsSold || 0
    }
  ];
  
  const columns = [
    { key: 'date', label: 'Fecha', sortable: true },
    { key: 'total', label: 'Total Ventas', sortable: true, render: (value) => `$${value.toFixed(2)}` },
    { key: 'transactions', label: 'Transacciones', sortable: true },
    { key: 'products', label: 'Productos Vendidos', sortable: true }
  ];
  
  return { data, columns };
};

const formatTopProductsData = (salesData) => {
  // This would need to be implemented based on actual sales cart data
  // For now, returning mock data that would be based on real data
  const data = [
    { id: 1, name: 'Producto A', category: 'Electrónica', sold: 150, revenue: 7500 },
    { id: 2, name: 'Producto B', category: 'Ropa', sold: 120, revenue: 4800 },
    { id: 3, name: 'Producto C', category: 'Alimentos', sold: 95, revenue: 2850 },
    { id: 4, name: 'Producto D', category: 'Electrónica', sold: 80, revenue: 4000 },
    { id: 5, name: 'Producto E', category: 'Hogar', sold: 75, revenue: 3750 }
  ];
  
  const columns = [
    { key: 'name', label: 'Producto', sortable: true },
    { key: 'category', label: 'Categoría', sortable: true },
    { key: 'sold', label: 'Cantidad Vendida', sortable: true },
    { key: 'revenue', label: 'Ingresos', sortable: true, render: (value) => `$${value.toFixed(2)}` }
  ];
  
  return { data, columns };
};

const formatInventoryData = (inventoryData) => {
  // Format inventory data with status based on minStockThreshold
  const data = inventoryData.inventoryList.map((item, index) => {
    // Calculate status based on minStockThreshold
    let status = 'normal';
    if (item.totalQuantity <= 0) {
      status = 'critical';
    } else if (item.totalQuantity <= (item.minStockThreshold || 5)) {
      status = 'low';
    }
    
    return {
      id: index + 1,
      name: item.name,
      category: item.categoryName || 'Sin Categoría',
      stock: item.totalQuantity || 0,
      minStock: item.minStockThreshold || 5,
      status: status,
      unit: item.unit || 'unidad'
    };
  });
  
  const columns = [
    { key: 'name', label: 'Producto', sortable: true },
    { key: 'category', label: 'Categoría', sortable: true },
    { key: 'stock', label: 'Stock Actual', sortable: true },
    { key: 'minStock', label: 'Stock Mínimo', sortable: true },
    { key: 'unit', label: 'Unidad', sortable: true },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      renderer: 'statusBadge' // Use a special renderer type instead of inline JSX
    }
  ];
  
  return { data, columns };
};

const formatSalesComparisonData = (currentData, previousData) => {
  // Calculate comparison between current and previous periods
  const changePercent = previousData.totalSales !== 0
    ? ((currentData.totalSales - previousData.totalSales) / previousData.totalSales) * 100
    : currentData.totalSales > 0 ? 100 : 0;
  
  const data = [
    {
      id: 1,
      category: 'General',
      current: currentData.totalSales,
      previous: previousData.totalSales,
      change: changePercent
    }
  ];
  
  const columns = [
    { key: 'category', label: 'Categoría', sortable: true },
    { key: 'current', label: 'Actual', sortable: true, render: (value) => `$${value.toFixed(2)}` },
    { key: 'previous', label: 'Anterior', sortable: true, render: (value) => `$${value.toFixed(2)}` },
    {
      key: 'change',
      label: 'Cambio %',
      sortable: true,
      renderer: 'changeBadge' // Use a special renderer type instead of inline JSX
    }
  ];
  
  return { data, columns };
};

// Function to get metrics for the dashboard
export const fetchReportMetrics = async (filters) => {
  try {
    const dateRange = {
      startDate: filters.startDate || new Date().toISOString().split('T')[0],
      endDate: filters.endDate || new Date().toISOString().split('T')[0]
    };

    // Get sales data
    const salesData = await getSalesForCategory(null, dateRange);

    // Get inventory data from store
    const store = useAppStore.getState();
    const { products, inventoryBatches } = store;

    // Calculate inventory metrics
    const filteredBatches = filters.storeId
      ? inventoryBatches.filter(batch => batch.locationId === filters.storeId)
      : inventoryBatches;

    const totalInventory = filteredBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);
    const totalProducts = [...new Set(filteredBatches.map(batch => batch.productId))].length;

    return {
      totalSales: salesData.totalSales || 0,
      totalTransactions: salesData.transactionCount || 0,
      totalProducts: totalProducts,
      totalInventory: totalInventory
    };
  } catch (error) {
    console.error('Error fetching report metrics:', error);
    throw error;
  }
};