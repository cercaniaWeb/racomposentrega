# Implementación de la Función de Reporting para Supabase

Este documento describe los pasos necesarios para implementar completamente la funcionalidad de reporting en el sistema POS.

## Archivos Involucrados

1. `create_reporting_functions_complete.sql` - Funciones SQL para la base de datos
2. `functions/reporting/index.ts` - Función de Edge Function
3. `src/services/reportsApi.js` - API frontend
4. `DOCUMENTACION_CAMBIOS_REPORTING.md` - Documentación detallada de los cambios

## Pasos para la Implementación

### 1. Crear las funciones SQL en la base de datos

1. Copia el contenido del archivo `create_reporting_functions_complete.sql`
2. Pega el contenido en el SQL Editor de tu proyecto de Supabase
3. Ejecuta el script para crear las funciones PostgreSQL

### 2. Desplegar la función de Edge Function

1. Asegúrate de tener el CLI de Supabase instalado
2. Desde la raíz del proyecto, ejecuta:
   ```
   supabase functions deploy reporting
   ```

### 3. Verificar la autenticación

1. Asegúrate de iniciar sesión en la aplicación con un usuario administrador
2. El usuario debe tener rol "admin" o "administrator" para acceder a los reportes

## Funcionalidades Implementadas

### Reportes Disponibles

1. **Productos Más Vendidos** (`top_products`)
   - Parámetros: `period`, `from`, `to`, `limit`, `store_id`
   - Devuelve: ID del producto, nombre, unidades vendidas, ingresos

2. **Ventas por Categoría** (`sales_by_category`)
   - Parámetros: `period`, `from`, `to`, `store_id`
   - Devuelve: ID de categoría, nombre, unidades vendidas, ingresos

3. **Resumen de Ventas** (`sales_summary`)
   - Parámetros: `period`, `from`, `to`, `store_id`
   - Devuelve: ventas totales, transacciones totales, valor promedio de transacción, producto más vendido

### Rutas de la API

- **Generación de reportes**: `/reporting/generate` (método POST)
- **Esquema de reportes**: `/reporting` (método GET)
- **Estado del servicio**: `/reporting/status` (método GET)

## Validación

Después de completar la implementación:

1. Verifica que no haya errores 500 o 404 en la consola del navegador
2. Asegúrate de que los usuarios administradores puedan acceder a los reportes
3. Confirma que los datos de los reportes se muestren correctamente

## Problemas Comunes

- **Error 401 "invalid_token"**: Verifica que un usuario administrador esté autenticado
- **Error 500 "PGRST202"**: Asegúrate de que las funciones SQL hayan sido creadas correctamente
- **Error 403 "forbidden"**: Confirma que el usuario tiene rol de administrador