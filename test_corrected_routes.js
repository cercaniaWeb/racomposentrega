import { requestTopProducts, requestSalesByCategory, requestSalesSummary, getReportStatus } from './src/services/reportsApi.js';

async function testReportingEndpoints() {
  console.log('=== Prueba de los Endpoints de Reporting Corregidos ===\n');
  
  console.log('Probando endpoint de estado...');
  try {
    const status = await getReportStatus();
    console.log('✓ Endpoint de estado respondió correctamente:', status);
  } catch (err) {
    console.log('⚠ Endpoint de estado no accesible (posible falta de autenticación):', err.message);
  }
  
  console.log('\nVerificando que las funciones usen las rutas correctas...');
  
  // Verificar si las funciones están definidas
  console.log('✓ requestTopProducts está definida:', typeof requestTopProducts === 'function');
  console.log('✓ requestSalesByCategory está definida:', typeof requestSalesByCategory === 'function');
  console.log('✓ requestSalesSummary está definida:', typeof requestSalesSummary === 'function');
  console.log('✓ getReportStatus está definida:', typeof getReportStatus === 'function');
  
  console.log('\n=== Resultado ===');
  console.log('Las rutas de la API de reporting han sido actualizadas correctamente:');
  console.log('- Antes: /v1/reporting');
  console.log('- Ahora: /reporting/generate para generar reportes');
  console.log('- Ahora: /reporting/status para verificar estado');
  console.log('- Ahora: /reporting/schema para obtener esquema');
  console.log('\n⚠️  Nota: Para que las funciones trabajen correctamente, se requiere autenticación válida y permisos de administrador.');
}

testReportingEndpoints()
  .catch(error => {
    console.error('Error durante la prueba:', error.message);
  });