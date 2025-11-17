import { createClient } from '@supabase/supabase-js';

// Configuración del cliente de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testReportingConnection() {
  console.log('=== Prueba de Conexión con la Función de Reporting ===\n');

  // Intentar obtener la sesión actual
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error obteniendo sesión:', error.message);
    return;
  }

  if (!session) {
    console.log('⚠️  No hay sesión activa. Debes iniciar sesión para probar los reportes.');
    console.log('Por favor, inicia sesión en la aplicación con un usuario administrador.\n');
    return;
  }

  console.log('✓ Sesión activa encontrada');
  console.log('Usuario ID:', session.user.id);
  console.log('Token expira en:', new Date(session.expires_at * 1000).toISOString());

  // Verificar el rol del usuario
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (userError) {
    console.log('⚠️  No se pudo verificar el rol del usuario desde la tabla users:', userError.message);
  } else if (userData) {
    console.log('Rol del usuario:', userData.role);
    
    if (userData.role !== 'admin' && userData.role !== 'administrator') {
      console.log('⚠️  El usuario no tiene rol de administrador, el cual es requerido para acceder a los reportes.');
    } else {
      console.log('✓ El usuario tiene rol de administrador');
    }
  }

  // Probar conexión con la función de reporting
  console.log('\nProbando conexión con la función de reporting...');
  
  try {
    // Probar el endpoint de estado
    console.log('Probando endpoint de estado...');
    const statusResponse = await fetch('https://pgbefqzlrvjnsymigfmv.functions.supabase.co/reporting/status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Estado: ${statusResponse.status} ${statusResponse.statusText}`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('Datos de estado:', statusData);
    } else {
      console.error('Error en la petición de estado:', await statusResponse.text());
    }
    
    // Probar el endpoint de generación de reporte (solo si el usuario es admin)
    if (userData && (userData.role === 'admin' || userData.role === 'administrator')) {
      console.log('\nProbando generación de reporte de productos más vendidos...');
      const reportResponse = await fetch('https://pgbefqzlrvjnsymigfmv.functions.supabase.co/reporting/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          report: 'top_products',
          params: {
            period: 'last_week',
            limit: 3
          }
        })
      });
      
      console.log(`Generación de reporte: ${reportResponse.status} ${reportResponse.statusText}`);
      
      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        console.log('Datos del reporte:', reportData);
      } else {
        console.error('Error en la petición de reporte:', await reportResponse.text());
      }
    }
    
  } catch (err) {
    console.error('Error en la conexión con la función de reporting:', err.message);
  }
}

// Ejecutar la prueba
testReportingConnection()
  .catch(error => {
    console.error('Error general:', error.message);
  });