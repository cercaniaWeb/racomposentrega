import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'zustand';
import { supabase } from '../config/supabase';

// Mock the supabase client and other dependencies
vi.mock('../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      or: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
      limit: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
      single: vi.fn(),
      count: vi.fn(),
    })),
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      updateUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      admin: {
        deleteUser: vi.fn()
      }
    }
  }
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: vi.fn(() => vi.fn())
}));

vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({ toDataURL: vi.fn() }))
}));

vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    addImage: vi.fn(),
    save: vi.fn()
  }))
}));

vi.mock('../utils/offlineStorage', () => ({
  default: {
    getAllData: vi.fn(() => Promise.resolve([])),
    updateData: vi.fn(() => Promise.resolve()),
    deleteData: vi.fn(() => Promise.resolve()),
    saveCart: vi.fn(() => Promise.resolve())
  }
}));

vi.mock('../utils/NotificationService', () => ({
  notificationService: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// Import the store after mocking dependencies
import createAppStore from '../store/useAppStore';

describe('POS Store - Catalog Loading and Cart Functionality', () => {
  let store;

  beforeEach(() => {
    // Create a fresh instance of the store for each test
    const createStore = createAppStore;
    store = createStore(create);
  });

  it('should allow adding products to cart regardless of inventory', () => {
    // Mock inventory batches with no stock for the test product
    const mockInventoryBatches = [
      { id: 'batch1', productId: 'product1', locationId: 'store1', quantity: 0 }
    ];
    
    // Mock current user
    store.setState({ 
      currentUser: { storeId: 'store1' },
      inventoryBatches: mockInventoryBatches 
    });

    // Mock product with no inventory
    const mockProduct = { 
      id: 'product1', 
      name: 'Test Product', 
      price: 10,
      stockInLocation: 0 // No stock available
    };

    // This should work now with our changes - add to cart should not be blocked by inventory
    store.addToCart(mockProduct);
    
    // Verify product was added to cart
    expect(store.getState().cart.length).toBe(1);
    expect(store.getState().cart[0].id).toBe('product1');
    expect(store.getState().cart[0].quantity).toBe(1);
  });

  it('should allow adding multiple quantities of products with no inventory', () => {
    // Mock inventory batches with no stock
    const mockInventoryBatches = [
      { id: 'batch1', productId: 'product1', locationId: 'store1', quantity: 0 }
    ];
    
    store.setState({ 
      currentUser: { storeId: 'store1' },
      inventoryBatches: mockInventoryBatches 
    });

    const mockProduct = { 
      id: 'product1', 
      name: 'Test Product', 
      price: 10,
      stockInLocation: 0 
    };

    // Add the same product multiple times
    store.addToCart(mockProduct);
    store.addToCart(mockProduct); // This should increase quantity to 2
    
    // Verify quantity was increased
    expect(store.getState().cart.length).toBe(1);
    expect(store.getState().cart[0].quantity).toBe(2);
  });

  it('should validate inventory at checkout time', async () => {
    // Mock inventory with insufficient stock
    const mockInventoryBatches = [
      { id: 'batch1', productId: 'product1', locationId: 'store1', quantity: 1 }
    ];
    
    store.setState({ 
      currentUser: { storeId: 'store1', name: 'Test User' },
      inventoryBatches: mockInventoryBatches,
      isOnline: true // Operating in online mode
    });

    // Add product with quantity 2 to cart, but only 1 in stock
    const mockProduct = { 
      id: 'product1', 
      name: 'Test Product', 
      price: 10,
      stockInLocation: 1 
    };

    store.addToCart(mockProduct);
    store.addToCart(mockProduct); // Now quantity is 2, but only 1 in stock

    // Mock the API functions
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: [{ id: 'sale1' }], error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    });

    // Attempt checkout with insufficient inventory
    const paymentData = { cash: 20, card: 0, cardCommission: 0, commissionInCash: false };
    const result = await store.handleCheckout(paymentData);
    
    // With our changes, checkout should fail if inventory is insufficient in online mode
    expect(result.success).toBe(false);
  });

  it('should allow checkout when sufficient inventory exists', async () => {
    // Mock inventory with sufficient stock
    const mockInventoryBatches = [
      { id: 'batch1', productId: 'product1', locationId: 'store1', quantity: 5 }
    ];
    
    store.setState({ 
      currentUser: { storeId: 'store1', name: 'Test User' },
      inventoryBatches: mockInventoryBatches,
      isOnline: true
    });

    // Add product with quantity 2 to cart, and 5 in stock
    const mockProduct = { 
      id: 'product1', 
      name: 'Test Product', 
      price: 10,
      stockInLocation: 5 
    };

    store.addToCart(mockProduct);
    store.addToCart(mockProduct); // Now quantity is 2, with 5 in stock

    // Mock successful API calls
    const mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({ data: [{ id: 'sale1' }], error: null }),
        update: vi.fn().mockResolvedValue({ error: null })
      }))
    };
    
    // Attempt checkout with sufficient inventory
    const paymentData = { cash: 20, card: 0, cardCommission: 0, commissionInCash: false };
    const result = await store.handleCheckout(paymentData);
    
    // Checkout should succeed when inventory is sufficient
    expect(result.success).toBe(true);
  });
});