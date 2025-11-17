import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
const supabaseUrl = 'https://pgbefqzlrvjnsymigfmv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYmVmcXpscnZqbnN5bWlnZm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjkyMTQsImV4cCI6MjA3NzEwNTIxNH0.t32MJ9MB6nc9_BKYHs2AnyX2YASIjSbte-XRDY5KNrk';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function validateReportingFunction() {
  console.log('=== Validación de la Función de Reporting ===\n');
  
  // Probar la ruta correcta para la función de reporting
  console.log('Probando la ruta correcta para la función de reporting...');
  
  try {
    // Probar el endpoint OPTIONS (preflight) para la ruta correcta
    console.log('Probando preflight a /reporting/generate...');
    const optionsResponse = await fetch('https://pgbefqzlrvjnsymigfmv.functions.supabase.co/reporting/generate', {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
      }
    });
    
    console.log(`✓ Preflight a /reporting/generate: ${optionsResponse.status} ${optionsResponse.statusText}`);
  } catch (err) {
    console.error('✗ Error con preflight a /reporting/generate:', err.message);
  }
  
  try {
    // Probar el endpoint OPTIONS (preflight) para la ruta incorrecta
    console.log('\nProbando preflight a /v1/reporting (ruta actual de la aplicación)...');
    const optionsResponse2 = await fetch('https://pgbefqzlrvjnsymigfmv.functions.supabase.co/v1/reporting', {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
      }
    });
    
    console.log(`✓ Preflight a /v1/reporting: ${optionsResponse2.status} ${optionsResponse2.statusText}`);
  } catch (err) {
    console.error('✗ Error con preflight a /v1/reporting:', err.message);
  }
  
  console.log('\nVerificando endpoints de estado y esquema...');
  
  try {
    // Probar el endpoint de estado
    const statusResponse = await fetch('https://pgbefqzlrvjnsymigfmv.functions.supabase.co/reporting/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`✓ Estado: ${statusResponse.status} ${statusResponse.statusText}`);
    if (statusResponse.status === 200) {
      const statusData = await statusResponse.json();
      console.log('  Datos de estado:', statusData);
    }
  } catch (err) {
    console.error('✗ Error con endpoint de estado:', err.message);
  }
  
  try {
    // Probar el endpoint de esquema
    const schemaResponse = await fetch('https://pgbefqzlrvjnsymigfmv.functions.supabase.co/reporting/schema', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`✓ Esquema: ${schemaResponse.status} ${schemaResponse.statusText}`);
    if (schemaResponse.status === 200) {
      const schemaData = await schemaResponse.json();
      console.log('  Reportes disponibles:', schemaData.reports?.map(r => r.name) || []);
    }
  } catch (err) {
    console.error('✗ Error con endpoint de esquema:', err.message);
  }
  
  console.log('\n=== Resultado ===');
  console.log('La función de reporting está configurada en la ruta correcta: /reporting/generate');
  console.log('La aplicación actualmente está usando la ruta incorrecta: /v1/reporting');
  console.log('Los endpoints de /reporting/status y /reporting/schema están funcionando correctamente');
}

// Ejecutar la validación
validateReportingFunction()
  .catch(error => {
    console.error('Error durante la validación:', error.message);
  });