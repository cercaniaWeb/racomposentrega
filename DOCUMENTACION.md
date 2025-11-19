# Documentación del Sistema POS RECOMPOSE

## Índice
1. [Introducción](#introducción)
2. [Características del Sistema](#características-del-sistema)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Correcciones y Mejoras Realizadas](#correcciones-y-mejoras-realizadas)
6. [Roles de Usuario](#roles-de-usuario)
7. [Gestión de Tiendas](#gestión-de-tiendas)
8. [Soluciones Técnicas](#soluciones-técnicas)
9. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
10. [Deploy y Configuración](#deploy-y-configuración)

## Introducción

El Sistema POS RECOMPOSE es una aplicación web progresiva (PWA) especializada en la gestión de puntos de venta para negocios de abarrotes multi-sucursal. La aplicación está construida con React, Vite, TailwindCSS y utiliza Supabase como backend para la autenticación y base de datos.

## Características del Sistema

- **Aplicación Web Progresiva (PWA)**: Funcionalidad offline, instalable en dispositivos móviles y escritorio
- **Multi-Tienda**: Soporte para múltiples ubicaciones de negocio
- **Gestión de Inventario**: Control de stock por ubicación con alertas de bajo stock
- **Autenticación Segura**: Sistema de roles y permisos
- **Interfaz Responsiva**: Compatible con móviles, tablets y escritorio

## Arquitectura del Sistema

### Tecnologías Utilizadas
- Frontend: React 18, Vite 5, Tailwind CSS
- Base de Datos: PostgreSQL (Supabase)
- Autenticación: Supabase Auth
- Almacenamiento: IndexedDB (offline), Supabase Storage
- Estado: Zustand
- Estilo: Tailwind CSS con tema oscuro

### Estructura de Directorios
```
src/
├── components/         # Componentes UI reutilizables
├── config/             # Configuración de servicios (Supabase)
├── features/           # Funcionalidades específicas
│   ├── auth/          # Autenticación
│   ├── inventory/     # Gestión de inventario
│   ├── pos/           # Punto de venta
│   ├── products/      # Gestión de productos
│   └── reports/       # Reportes
├── pages/             # Páginas de la aplicación
├── services/          # Servicios externos
├── store/             # Store de Zustand
├── utils/             # Funciones de utilidad
└── hooks/             # Hooks personalizados
```

## Funcionalidades Implementadas

### 1. Sistema de Autenticación
- Registro e inicio de sesión de usuarios
- Recuperación de contraseña
- Roles de usuarios (cajera, gerente, admin, dev)
- Verificación de sesión persistente

### 2. Punto de Venta (POS)
- Interfaz rápida de venta
- Búsqueda de productos
- Escaneo de códigos de barras
- Gestión de carrito
- Procesamiento de pagos
- Impresión de tickets

### 3. Gestión de Inventario
- Control de stock por ubicación
- Alertas de bajo stock
- Transferencias entre tiendas
- Lotes de existencias

### 4. Gestión de Productos
- Catálogo de productos
- Categorías y subcategorías
- Precios y costos
- SKU y códigos de barras

### 5. Reportes
- Reportes de ventas
- Análisis de rendimiento
- Gráficos y estadísticas
- Exportación de datos

### 6. Gestión de Usuarios
- Creación, edición y eliminación de usuarios
- Asignación de roles
- Asignación a tiendas
- Soporte para múltiples tiendas por usuario

## Correcciones y Mejoras Realizadas

### 1. Eliminación del Impuesto del 13%
- **Problema**: El sistema aplicaba un 13% de impuesto a todas las ventas
- **Solución**: Eliminación del cálculo de impuestos en el componente `CartPanel`
- **Resultado**: Las ventas ahora se calculan sin impuestos aplicados

### 2. Corrección del Logo
- **Problema**: El logo no se mostraba en la aplicación ni en los tickets
- **Solución**: Actualización de la referencia del favicon en `index.html` y configuración del logo por defecto en la configuración de tickets
- **Resultado**: El logo ahora se muestra correctamente en todos los componentes

### 3. Mejora de Responsividad
- **Problema**: La aplicación no se adaptaba adecuadamente a diferentes tamaños de pantalla
- **Solución**: Ajuste de clases de Tailwind CSS para mejor adaptabilidad
- **Resultado**: Interfaz completamente responsive

### 4. Adición de Botones Faltantes
- **Problema**: Faltaban botones importantes en la interfaz del POS
- **Solución**: Añadidos botones para:
  - Cerrar Caja
  - Agenda
  - Retiro
  - Descuento
- **Resultado**: Interfaz completa con todas las funcionalidades accesibles

### 5. Corrección de Estilos de Reportes
- **Problema**: El módulo de reportes tenía fondo blanco en lugar del tema oscuro
- **Solución**: Aplicación de estilos consistentes con el tema oscuro del sistema
- **Resultado**: Módulo de reportes con coherencia visual

### 6. Mejora de Autenticación de Recuperación de Contraseña
- **Problema**: El enlace de recuperación de contraseña mostraba error
- **Solución**: Mejora en el manejo de parámetros de hash y redirección en el componente `PasswordResetHandler`
- **Resultado**: Proceso de recuperación de contraseña funcional

### 7. Corrección de Múltiples Instancias de Cliente
- **Problema**: Error "Multiple GoTrueClient instances detected"
- **Solución**: Centralización de la instancia del cliente de Supabase en `src/config/supabase.js`
- **Resultado**: Una sola instancia compartida por toda la aplicación

### 8. Soporte para Múltiples Tiendas por Usuario
- **Problema**: Cada usuario solo podía estar asignado a una tienda
- **Solución**: Actualización de las funciones `addUser` y `updateUser` para permitir múltiples asignaciones
- **Resultado**: Usuarios pueden pertenecer a múltiples tiendas simultáneamente

## Roles de Usuario

### 1. Cajera (`cajera`)
- Acceso al punto de venta
- Procesamiento de ventas
- Acceso limitado a otras funcionalidades

### 2. Gerente (`gerente`)
- Todas las funcionalidades de cajera
- Acceso a reportes
- Gestión de transferencias
- Gestión de inventario
- Acceso limitado a usuarios y configuraciones

### 3. Administrador (`admin`)
- Acceso completo a todas las funcionalidades
- Gestión de usuarios
- Configuración avanzada
- Acceso a todas las tiendas

### 4. Desarrollador (`dev`)
- Acceso completo como admin
- Funcionalidades especiales para desarrollo
- Acceso a herramientas de administración de tiendas

## Gestión de Tiendas

### Asignación de Usuarios a Tiendas
- Los usuarios pueden estar asignados a una o varias tiendas
- La funcionalidad soporta múltiples asignaciones de tiendas por usuario
- La asignación se maneja en la tabla intermedia `user_stores`

### Tipos de Tiendas
- Bodega Central
- Sucursales (Tienda 1, Tienda 2, etc.)
- Soporte para expansión con nuevas ubicaciones

## Soluciones Técnicas

### 1. Solución para Autenticación
- Uso de `supabase.auth.signUp()` en lugar de `supabase.auth.admin.createUser()` por seguridad
- Separación de lógica de autenticación y perfil de usuario
- Manejo seguro de contraseñas

### 2. Solución para RLS (Row Level Security)
- Manejo adecuado de errores de RLS en la inicialización
- Mensajes de advertencia en lugar de errores que interrumpen

### 3. Solución para Persistencia Offline
- Almacenamiento en IndexedDB para funcionalidad offline
- Sincronización automática cuando se recupera la conectividad
- Soporte para operaciones en modo sin conexión

### 4. Solución para Múltiples Instancias
- Centralización del cliente de Supabase en un único archivo
- Importación de la instancia centralizada en lugar de creación de nuevas instancias

## Consideraciones de Seguridad

### 1. Autenticación y Autorización
- Uso de tokens JWT para autenticación
- Sistema de roles para control de acceso
- Políticas de Row Level Security en Supabase

### 2. Manejo de Contraseñas
- Contraseñas nunca almacenadas en texto plano
- Uso de la API de Supabase para manejo seguro de contraseñas
- Funcionalidad de restablecimiento de contraseña

### 3. Protección contra Ataques
- Validación de entradas en todos los endpoints
- Manejo adecuado de errores sin revelar información sensible
- Política de seguridad de CORS configurada

## Deploy y Configuración

### Variables de Entorno
- `VITE_SUPABASE_URL`: URL del proyecto de Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase
- `VITE_AI_API_URL`: URL opcional para servicios de IA

### Configuración de Redirección en Supabase
- Site URL: `https://racompose.netlify.app`
- Redirect URLs: `https://racompose.netlify.app/auth/callback`

### Despliegue en Netlify
- Configuración de variables de entorno en Netlify
- Activación de HTTPS
- Configuración de redirecciones para PWA

## Conclusiones

El sistema POS RECOMPOSE es una solución completa y funcional para la gestión de puntos de venta en negocios de abarrotes multi-sucursal. La implementación incluye todas las funcionalidades necesarias para operar un sistema de ventas completo, con especial atención a la seguridad, usabilidad y rendimiento. Las mejoras y correcciones realizadas han optimizado el desempeño y la experiencia del usuario, haciéndolo apto para su uso en entornos de producción.