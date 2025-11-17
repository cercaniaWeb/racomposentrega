// src/services/storeManagement.js
import { supabase } from '../config/supabase';

export const addNewStore = async (storeData) => {
  try {
    const { data, error } = await supabase
      .rpc('add_store_safe', {
        p_id: storeData.id,
        p_name: storeData.name,
        p_address: storeData.address,
        p_phone: storeData.phone
      });

    if (error) {
      throw new Error(error.message);
    }

    return data[0]; // Retorna el resultado de éxito/mensaje
  } catch (error) {
    console.error('Error adding store:', error);
    throw error;
  }
};