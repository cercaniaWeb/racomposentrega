# RECOOM POS - Sistema de Punto de Venta para Abarrotes Multi-Sucursal

RECOOM POS es un sistema especializado de Punto de Venta diseñado para tiendas de abarrotes con modelo de inventario distribuido. El sistema soporta múltiples ubicaciones: Bodega Central, Tienda 1 y Tienda 2. Está construido como una Aplicación Web Progresiva (PWA) para funcionar en entornos con conectividad variable, permitiendo operación completamente fuera de línea.

## Características Principales

- **Capacidades PWA**: Instalable, operación fuera de línea, sincronización automática
- **Interfaz POS**: Interfaz de venta rápida con búsqueda de productos y escaneo de códigos de barras
- **Control de Inventario Distribuido**: Control de stock por ubicación con alertas de bajo stock
- **Transferencias entre Tiendas**: Solicitud, aprobación y seguimiento de transferencias
- **Acceso Basado en Roles**: Diferentes permisos para Cajero, Gerente y Administrador
- **Reportes**: Reportes de ventas, análisis de ganancias y movimientos de inventario
- **Diseño Responsivo**: Funciona en móviles, tabletas y escritorio
- **Control de Consumo de Empleados**: Para hacer seguimiento de artículos consumidos por empleados
- **Gestión de Lista de Compras**: Funcionalidad para crear solicitudes de compra y generar gastos

## Tecnologías Clave

- **Frontend**: React (SPA) con Vite
- **Estilos**: Tailwind CSS con soporte para modo oscuro
- **Gestión de Estado**: Zustand
- **Base de Datos**: Supabase (PostgreSQL) con almacenamiento local IndexedDB
- **Almacenamiento Fuera de Línea**: IndexedDB para funcionalidad fuera de línea
- **Despliegue**: PWA (Aplicación Web Progresiva)

## Cómo Iniciar

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

### Comandos de Desarrollo

- Iniciar servidor de desarrollo: `npm run dev`
- Construir para producción: `npm run build`
- Previsualizar build de producción: `npm run preview`
- Construir PWA: `npm run build-pwa`
- Lintear código: `npm run lint`
- Ejecutar pruebas: `npm run test` o `npm run test:run`
- Ejecutar pruebas e2e: `npm run test:e2e`
- Configurar base de datos: `npm run setup-db`
- Validar base de datos: `npm run validate-db`

## Configuración de Entorno

### Desarrollo Local

Crear un archivo `.env.local` con las credenciales de Supabase:

```env
VITE_SUPABASE_URL=tu_url_de_supabase_aquí
VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase_aquí
```

> **Nota de Seguridad:** Nunca subas archivos `.env` con credenciales reales al repositorio. El archivo `.gitignore` incluye patrones para evitar esto.

### Despliegue en Netlify

Para desplegar en Netlify, debes configurar las variables de entorno en la configuración del sitio:

1. Ve a tu sitio en Netlify
2. Navega a `Settings` > `Build & deploy` > `Environment`
3. Agrega las siguientes variables:
   - `VITE_SUPABASE_URL`: Tu URL de Supabase (formato: https://[id].supabase.co)
   - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima de Supabase (puedes encontrarla en tu proyecto de Supabase > Authentication > API)

> **Importante:** Estas variables deben tener el prefijo `VITE_` para que Vite las incluya en el bundle del frontend.

---

*Proyecto desarrollado para el control y gestión de tiendas de abarrotes con múltiples ubicaciones.*