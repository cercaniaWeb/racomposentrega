import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
const supabaseUrl = 'https://pgbefqzlrvjnsymigfmv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYmVmcXpscnZqbnN5bWlnZm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjkyMTQsImV4cCI6MjA3NzEwNTIxNH0.t32MJ9MB6nc9_BKYHs2AnyX2YASIjSbte-XRDY5KNrk';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testReportingFunction() {
  console.log('=== Prueba de la Función de Reporting ===\n');
  
  // Obtener sesión
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session || !session.access_token) {
    console.log('No hay sesión activa o el token no es válido.');
    console.log('Para acceder a los reportes, debes iniciar sesión con un usuario administrador.');
    return;
  }
  
  console.log('Token de acceso disponible. Probando generación de reporte...');
  
  try {
    // Probar generación de reporte de productos más vendidos
    const response = await fetch('https://pgbefqzlrvjnsymigfmv.functions.supabase.co/reporting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        report: 'top_products',
        params: {
          period: 'last_week',
          limit: 3
        }
      })
    });
    
    console.log(`Respuesta: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log('Error en la respuesta:', await response.text());
    } else {
      const data = await response.json();
      console.log('Datos del reporte:', data);
    }
  } catch (err) {
    console.error('Error de red o conexión:', err.message);
  }
}

testReportingFunction()
  .catch(error => {
    console.error('Error general:', error.message);
  });