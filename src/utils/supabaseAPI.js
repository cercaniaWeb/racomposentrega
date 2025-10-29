import { supabase } from '../config/supabase';

// Funciones para productos
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }

  return data;
};

export const getProduct = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error obteniendo producto:', error);
    return null;
  }

  return data;
};

export const addProduct = async (productData) => {
  // Copiar los datos del producto sin modificar el original
  const mappedProductData = { ...productData };

  // Mapear campos del formulario a los campos correctos de la base de datos
  if ('categoryId' in mappedProductData) {
    mappedProductData.category_id = mappedProductData.categoryId;
    delete mappedProductData.categoryId;
  }
  if ('subcategoryId' in mappedProductData) {
    mappedProductData.subcategory_id = mappedProductData.subcategoryId;
    delete mappedProductData.subcategoryId;
  }
  if ('unitOfMeasure' in mappedProductData) {
    mappedProductData.unit = mappedProductData.unitOfMeasure;
    delete mappedProductData.unitOfMeasure;
  }
  if ('image' in mappedProductData) {
    mappedProductData.image_url = mappedProductData.image;
    delete mappedProductData.image;
  }
  if ('expirationDate' in mappedProductData) {
    delete mappedProductData.expirationDate; // Este campo no existe en la base de datos de productos
  }
  if ('createdAt' in mappedProductData) {
    delete mappedProductData.createdAt; // Eliminar, ya que se establece automáticamente
  }
  if ('updatedAt' in mappedProductData) {
    delete mappedProductData.updatedAt; // Eliminar, ya que se establece automáticamente
  }
  if ('created_at' in mappedProductData) {
    delete mappedProductData.created_at; // Eliminar, ya que se establece automáticamente
  }
  if ('updated_at' in mappedProductData) {
    delete mappedProductData.updated_at; // Eliminar, ya que se establece automáticamente
  }
  if ('wholesalePrice' in mappedProductData) {
    delete mappedProductData.wholesalePrice; // Este campo no existe en la base de datos
  }

  // Agregar campos automáticos
  mappedProductData.created_at = new Date().toISOString();
  mappedProductData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('products')
    .insert([mappedProductData])
    .select('id')
    .single();

  if (error) {
    console.error('Error agregando producto:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateProduct = async (id, productData) => {
  // Copiar los datos del producto sin modificar el original
  const mappedProductData = { ...productData };

  // Mapear campos del formulario a los campos correctos de la base de datos
  if ('categoryId' in mappedProductData) {
    mappedProductData.category_id = mappedProductData.categoryId;
    delete mappedProductData.categoryId;
  }
  if ('subcategoryId' in mappedProductData) {
    mappedProductData.subcategory_id = mappedProductData.subcategoryId;
    delete mappedProductData.subcategoryId;
  }
  if ('unitOfMeasure' in mappedProductData) {
    mappedProductData.unit = mappedProductData.unitOfMeasure;
    delete mappedProductData.unitOfMeasure;
  }
  if ('image' in mappedProductData) {
    mappedProductData.image_url = mappedProductData.image;
    delete mappedProductData.image;
  }
  if ('expirationDate' in mappedProductData) {
    delete mappedProductData.expirationDate; // Este campo no existe en la base de datos de productos
  }
  if ('createdAt' in mappedProductData) {
    delete mappedProductData.createdAt; // No se actualiza en ediciones
  }
  if ('updatedAt' in mappedProductData) {
    delete mappedProductData.updatedAt; // No se envía, se gestiona automáticamente
  }
  if ('created_at' in mappedProductData) {
    delete mappedProductData.created_at; // No se actualiza en ediciones
  }
  if ('updated_at' in mappedProductData) {
    delete mappedProductData.updated_at; // No se envía, se gestiona automáticamente
  }
  if ('wholesalePrice' in mappedProductData) {
    delete mappedProductData.wholesalePrice; // Este campo no existe en la base de datos
  }

  // Actualizar el campo updated_at
  mappedProductData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('products')
    .update(mappedProductData)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando producto:', error);
    throw new Error(error.message);
  }
};

export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando producto:', error);
    throw new Error(error.message);
  }
};

// Funciones para categorías
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }

  return data;
};

export const addCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{
      ...categoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando categoría:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateCategory = async (id, categoryData) => {
  const { error } = await supabase
    .from('categories')
    .update({
      ...categoryData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error actualizando categoría:', error);
    throw new Error(error.message);
  }
};

// Funciones para usuarios
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }

  return data;
};

export const getUser = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }

  return data;
};

export const addUser = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando usuario:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateUser = async (id, userData) => {
  const { error } = await supabase
    .from('users')
    .update({
      ...userData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error actualizando usuario:', error);
    throw new Error(error.message);
  }
};

// Funciones para tiendas
export const getStores = async () => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo tiendas:', error);
    return [];
  }

  return data;
};

// Funciones para lotes de inventario
export const getInventoryBatches = async () => {
  const { data, error } = await supabase
    .from('inventory_batches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo lotes de inventario:', error);
    return [];
  }

  return data;
};

export const addInventoryBatch = async (inventoryData) => {
  const { data, error } = await supabase
    .from('inventory_batches')
    .insert([{
      ...inventoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando lote de inventario:', error);
    throw new Error(error.message);
  }

  return data.id;
};

// Funciones para ventas
export const getSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error obteniendo ventas:', error);
    return [];
  }

  return data;
};

export const addSale = async (saleData) => {
  const { data, error } = await supabase
    .from('sales')
    .insert([{
      ...saleData,
      date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando venta:', error);
    throw new Error(error.message);
  }

  return data.id;
};

// Funciones para clientes
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo clientes:', error);
    return [];
  }

  return data;
};

export const addClient = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      ...clientData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando cliente:', error);
    throw new Error(error.message);
  }

  return data.id;
};

// Funciones para transferencias
export const getTransfers = async () => {
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo transferencias:', error);
    return [];
  }

  return data;
};

// Funciones para lista de compras
export const getShoppingList = async () => {
  const { data, error } = await supabase
    .from('shopping_list')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo lista de compras:', error);
    return [];
  }

  return data;
};

// Funciones para gastos
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo gastos:', error);
    return [];
  }

  return data;
};

// Funciones para cierres de caja
export const getCashClosings = async () => {
  const { data, error } = await supabase
    .from('cash_closings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo cierres de caja:', error);
    return [];
  }

  return data;
};

// Inicializar colecciones/tablas por defecto si no existen
export const initializeSupabaseCollections = async () => {
  try {
    // Verificar si existen categorías y agregar por defecto si no hay
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('Error obteniendo categorías:', categoriesError);
    } else if (!categories || categories.length === 0) {
      // Agregar categorías por defecto
      const defaultCategories = [
        { name: 'Abarrotes', parent_id: null },
        { name: 'Vicio', parent_id: null },
        { name: 'Bebidas', parent_id: null }
      ];

      for (const cat of defaultCategories) {
        try {
          await addCategory({
            ...cat,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (err) {
          console.error('Error agregando categoría por defecto:', err);
        }
      }
    }

    // Verificar si existen tiendas y agregar por defecto si no hay
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*');

    if (storesError) {
      console.error('Error obteniendo tiendas:', storesError);
    } else if (!stores || stores.length === 0) {
      // Agregar tiendas por defecto
      const defaultStores = [
        { id: 'bodega-central', name: 'Bodega Central' },
        { id: 'tienda1', name: 'Tienda 1' },
        { id: 'tienda2', name: 'Tienda 2' }
      ];

      for (const store of defaultStores) {
        try {
          const { error } = await supabase
            .from('stores')
            .insert([{
              ...store,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (error) {
            console.error('Error agregando tienda por defecto:', error);
          }
        } catch (err) {
          console.error('Error agregando tienda por defecto:', err);
        }
      }
    }
  } catch (error) {
    console.error('Error inicializando colecciones de Supabase:', error);
  }
};