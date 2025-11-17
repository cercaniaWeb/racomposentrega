# Características de Aplicación Web Progresiva (PWA)

## Resumen
Esta aplicación de punto de venta incluye soporte completo de PWA, lo que permite trabajar sin conexión e instalarse en dispositivos móviles como una aplicación nativa.

## Características Clave de PWA

### 1. Instalable
- Puede instalarse en dispositivos móviles y computadoras de escritorio
- Aparece como una aplicación independiente con su propio icono
- Funciona sin interfaz de navegador

### 2. Soporte Sin Conexión
- Los datos se almacenan en caché localmente usando IndexedDB
- Funciona incluso cuando no hay conexión a internet
- Las transacciones se almacenan localmente y se sincronizan cuando hay conexión

### 3. Diseño Responsivo
- Optimizado para todos los tamaños de pantalla (móvil, tableta, escritorio)
- Interfaz táctil amigable para dispositivos móviles
- Se adapta a diferentes orientaciones

### 4. Resistencia de Red
- Detecta automáticamente el estado de la red
- Cambia sin problemas entre modos en línea y sin conexión
- Muestra indicadores claros cuando se trabaja sin conexión

## Implementación Técnica

### Service Worker
- Almacena en caché activos críticos para acceso sin conexión
- Maneja solicitudes de red y proporciona alternativas
- Gestiona la sincronización en segundo plano

### Archivo de Manifiesto
- Define la apariencia y comportamiento de la aplicación
- Incluye iconos de la aplicación y colores de tema
- Especifica el modo de visualización y la URL de inicio

### Almacenamiento IndexedDB
- Almacena productos, categorías y datos de inventario
- Almacena transacciones en caché para procesamiento sin conexión
- Mantiene la consistencia de datos entre sesiones

## Cómo Usar las Características de PWA

### Instalar la Aplicación
1. Abre la aplicación en un navegador moderno (Chrome, Edge, Firefox, Safari)
2. Busca el aviso de instalación o la opción de menú
3. Haz clic en "Instalar" o "Agregar a la pantalla de inicio"
4. La aplicación aparecerá como un icono independiente en tu dispositivo

### Trabajar Sin Conexión
1. La aplicación detecta automáticamente el estado de la red
2. Cuando estás sin conexión, aún puedes:
   - Ver catálogos de productos
   - Procesar ventas (almacenadas localmente)
   - Acceder a transacciones anteriores
3. Cuando vuelves a tener conexión, los datos se sincronizan automáticamente

### Indicadores de Estado de Red
- Punto verde: En línea y conectado
- Punto rojo con "Modo Sin Conexión": Trabajando sin conexión
- Banner amarillo: Problemas de red detectados

## Compilación para Producción
Para compilar la PWA para producción:

```bash
npm run build-pwa
```

Este comando:
1. Compila la aplicación React
2. Copia los activos de PWA a la carpeta dist
3. Prepara la aplicación para despliegue

## Prueba del Modo Sin Conexión
1. Abre las herramientas de desarrollo de Chrome
2. Ve a la pestaña Aplicación
3. Marca "Sin conexión" en las condiciones de red
4. Actualiza la página para ver el comportamiento sin conexión

## Navegadores Soportados
- Chrome 67+
- Edge 79+
- Firefox 63+
- Safari 11.1+

Nota: Algunas características pueden variar según el navegador.