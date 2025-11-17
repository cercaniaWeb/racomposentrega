import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
const supabaseUrl = 'https://pgbefqzlrvjnsymigfmv.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYmVmcXpscnZqbnN5bWlnZm12Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTUyOTIxNCwiZXhwIjoyMDc3MTA1MjE0fQ.j2yBeWDSHmdESPjJx4thILjF_5Ft9fq7c3MqRKFwdwU';

// Crear cliente de Supabase con la llave de servicio (permite acceso completo sin autenticación de usuario)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function validateConnection() {
  try {
    console.log('Intentando conectar con la base de datos de Supabase...');
    
    // Intentar leer una tabla simple (por ejemplo, la tabla de categorías)
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error consultando la tabla de categorías:', error.message);
      return false;
    }
    
    console.log('✓ Conexión exitosa con la base de datos de Supabase');
    console.log('✓ Se pudo acceder a la tabla de categorías');
    
    // Verificar si hay una función de reporting accesible
    console.log('\nVerificando función de reporting...');
    try {
      const response = await fetch('https://pgbefqzlrvjnsymigfmv.functions.supabase.co/reporting/generate', {
        method: 'OPTIONS', // Preflight request
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`✓ Preflight request para reporting: ${response.status} ${response.statusText}`);
    } catch (err) {
      console.error('✗ Error con la función de reporting:', err.message);
      console.log('Este error probablemente sea un problema de CORS o configuración de la función de Supabase');
    }
    
    return true;
  } catch (error) {
    console.error('Error general conectando con la base de datos:', error.message);
    return false;
  }
}

// Ejecutar la validación
validateConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Validación completada: La conexión con Supabase está funcionando correctamente');
    } else {
      console.log('\n❌ Validación fallida: Hay problemas con la conexión a Supabase');
    }
  })
  .catch(error => {
    console.error('\n❌ Error durante la validación:', error.message);
  });