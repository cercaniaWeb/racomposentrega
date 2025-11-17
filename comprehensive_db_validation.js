import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
const supabaseUrl = 'https://pgbefqzlrvjnsymigfmv.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYmVmcXpscnZqbnN5bWlnZm12Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTUyOTIxNCwiZXhwIjoyMDc3MTA1MjE0fQ.j2yBeWDSHmdESPjJx4thILjF_5Ft9fq7c3MqRKFwdwU';

// Crear cliente de Supabase con la llave de servicio (permite acceso completo sin autenticación de usuario)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function validateTable(tableName, selectFields = 'id', limit = 1) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(selectFields)
      .limit(limit);
    
    if (error) {
      console.error(`✗ Error consultando la tabla '${tableName}':`, error.message);
      return false;
    }
    
    console.log(`✓ Éxito consultando la tabla '${tableName}'`);
    return true;
  } catch (error) {
    console.error(`✗ Error general consultando la tabla '${tableName}':`, error.message);
    return false;
  }
}

async function validateConnection() {
  console.log('=== Validación Completa de Conexión con la Base de Datos ===\n');
  
  // Tablas principales del sistema POS
  const tablesToValidate = [
    'products',
    'categories',
    'users',
    'stores',
    'inventory_batches',
    'sales',
    'clients',
    'transfers',
    'shopping_list',
    'expenses',
    'cash_closings'
  ];
  
  console.log('Intentando conectar con la base de datos de Supabase...\n');
  
  let successCount = 0;
  const totalTables = tablesToValidate.length;
  
  for (const tableName of tablesToValidate) {
    console.log(`Validando tabla: ${tableName}`);
    const success = await validateTable(tableName);
    if (success) {
      successCount++;
    }
    console.log(''); // Espacio entre validaciones
  }
  
  console.log(`=== Resultado Final ===`);
  console.log(`Tablas exitosas: ${successCount}/${totalTables}`);
  
  if (successCount === totalTables) {
    console.log('🎉 ¡Todas las tablas principales están accesibles!');
    console.log('✓ La base de datos de Supabase está completamente funcional');
  } else {
    console.log('⚠️  Algunas tablas no pudieron ser accedidas. Revisa los errores anteriores.');
  }
  
  // Verificar la función de reporting
  console.log('\n=== Verificación de la función de reporting ===');
  try {
    const response = await fetch('https://pgbefqzlrvjnsymigfmv.functions.supabase.co/reporting/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test_connection'
      })
    });
    
    console.log(`✓ Request a la función de reporting: ${response.status} ${response.statusText}`);
    
    if (response.status === 401 || response.status === 403) {
      console.log('⚠️  La función de reporting requiere autenticación o tiene restricciones de acceso');
    } else if (response.status === 404) {
      console.log('⚠️  La función de reporting no existe o no está correctamente configurada');
    } else if (response.status >= 200 && response.status < 300) {
      console.log('✓ La función de reporting está funcionando correctamente');
    } else {
      console.log(`⚠️  La función de reporting respondió con un código ${response.status}`);
    }
  } catch (err) {
    console.error('✗ Error con la función de reporting:', err.message);
    console.log('Este error probablemente sea un problema de CORS, autenticación o configuración de la función de Supabase');
  }
}

// Ejecutar la validación completa
validateConnection()
  .catch(error => {
    console.error('\n❌ Error general durante la validación:', error.message);
  });