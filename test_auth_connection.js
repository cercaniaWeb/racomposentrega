import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
const supabaseUrl = 'https://pgbefqzlrvjnsymigfmv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYmVmcXpscnZqbnN5bWlnZm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjkyMTQsImV4cCI6MjA3NzEwNTIxNH0.t32MJ9MB6nc9_BKYHs2AnyX2YASIjSbte-XRDY5KNrk';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('=== Prueba de Conexión con la Función de Reporting ===\n');
  
  // Intentar obtener la sesión actual
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error obteniendo sesión:', error.message);
    return;
  }
  
  if (!session) {
    console.log('No hay sesión activa. Necesitas iniciar sesión para acceder a los reportes.');
    return;
  }
  
  console.log('Sesión activa encontrada');
  console.log('Usuario ID:', session.user.id);
  console.log('Token de acceso disponible:', !!session.access_token);
  console.log('Token expira en:', new Date(session.expires_at * 1000).toISOString());
  
  // Verificar el rol del usuario
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (userData) {
    console.log('Rol del usuario:', userData.role);
    
    if (userData.role !== 'admin' && userData.role !== 'administrator') {
      console.log('⚠️  Advertencia: El usuario no tiene rol de administrador, el cual es requerido para acceder a los reportes.');
    } else {
      console.log('✓ El usuario tiene rol de administrador');
    }
  } else {
    console.log('⚠️  No se pudo obtener el rol del usuario desde la tabla users.');
  }
  
  // Probar conexión con la función de reporting
  console.log('\nProbando conexión con la función de reporting...');
  try {
    const response = await fetch('https://pgbefqzlrvjnsymigfmv.functions.supabase.co/reporting/status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Estado: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log('Respuesta:', data);
  } catch (err) {
    console.error('Error en la petición:', err.message);
  }
}

testConnection()
  .catch(error => {
    console.error('Error general:', error.message);
  });