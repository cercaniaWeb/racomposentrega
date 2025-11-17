Ficha Técnica de Estilos: Sistema POS Abarrotes (Dark Mode)

Este documento detalla las especificaciones precisas de estilo (colores, tipografía, componentes y espaciado) utilizadas en el sistema de Punto de Venta (POS) para abarrotes, basado en Tailwind CSS.

1. Paleta de Colores

La paleta se divide en colores de Fondo, Primarios (Acción), Éxito y Peligro.

Uso

Clase Tailwind

Código Hex (Aprox.)

Descripción

Fondo Principal

bg-gray-900

#111827

Fondo general de la aplicación.

Fondo de Componente

bg-gray-800

#1f2937

Contenedores principales (Carrito, Productos, Teclado).

Fondo de Elemento

bg-gray-700

#374151

Tarjetas de producto, botones de teclado.

Bordes/Divisores

border-gray-700

#374151

Líneas divisorias internas.

Texto Primario

text-white

#ffffff

Texto principal, títulos.

Texto Secundario

text-gray-400

#9ca3af

Etiquetas, descripciones.

Primario (Acción)

bg-blue-600 / text-blue-400

#2563eb / #60a5fa

Botones de Checkout, botones de cantidad.

Éxito (Precios/Total)

text-green-400

#4ade80

Precios, totales y mensajes de éxito.

Advertencia/Peligro

text-red-400

#f87171

Botones de Vaciar Carrito, remover ítem.

Entrada Keypad

bg-gray-900

#111827

Fondo del display de entrada del teclado numérico.

2. Tipografía

Uso

Estilo (Clase Tailwind)

Tamaño

Peso

Título Principal

text-3xl / font-extrabold

30px

800 (Extra Bold)

Total Carrito

text-3xl / font-extrabold / text-green-400

30px

800 (Extra Bold)

Nombre Producto

text-base / font-semibold / text-white

16px

600 (Semi Bold)

Botones Teclado

text-xl / font-semibold

20px

600 (Semi Bold)

Input Keypad

text-2xl / font-mono / tracking-wider

24px

500 (Medium)

Botones Categoría

text-sm / font-medium

14px

500 (Medium)

Fuente Predeterminada: Sans Serif (font-sans), que en Tailwind por defecto es una pila de fuentes legible (generalmente Inter o System UI).

Fuente Monospaced: Se utiliza font-mono para la visualización de la entrada numérica del teclado.

3. Componentes y Geometría

Componente

Apariencia

Especificación Clave

Contenedores Principales

Fondo Oscuro Elevado

bg-gray-800, rounded-xl, shadow-lg, border border-gray-700.

Tarjetas de Producto

Botón de Tono Oscuro

bg-gray-700, rounded-xl, Efecto Hover: hover:bg-gray-600, hover:scale-[1.02].

Campo de Búsqueda

Input con Iconos Integrados

bg-gray-700, rounded-xl, pl-10 (para lupa), pr-12 (para escáner).

Botón Primario

Botón de Acción Azul

bg-blue-600, text-white, font-bold, rounded-xl, shadow-lg shadow-blue-500/50.

Botones de Teclado

Teclas Cuadradas

bg-gray-700, p-4, rounded-xl, shadow-lg.

Botones de Categoría

Píldoras de Filtro

rounded-full, px-4 py-1, Activo: bg-blue-600.

Ítem de Carrito

Tira de Listado

bg-gray-700, rounded-lg, Seleccionado: bg-blue-900 border border-blue-600.

4. Espaciado y Distribución (Mobile First)

Medida

Especificación

Uso Principal

Padding Global

p-4 (móvil), p-6 (escritorio)

Espaciado alrededor de toda la aplicación.

Gap/Espacio entre Módulos

gap-6 (vertical/horizontal)

Separación entre el ProductGrid y la columna lateral.

Margin de Título

mb-6

Espacio debajo del título principal.

Espacio de Grilla

gap-4

Espaciado entre tarjetas de producto.

Bordes de Componentes

rounded-xl (12px)

Radio de esquina para contenedores principales.

5. Responsividad (Layout)

Contenedor Principal: El diseño es flex-col (columna) en dispositivos móviles (w-full) y lg:flex-row (fila) en dispositivos grandes.

Product Grid: Utiliza flex-1 para ocupar el espacio restante. La cuadrícula interna de productos cambia de grid-cols-2 a sm:grid-cols-3 y lg:grid-cols-4.

Columna Lateral (Carrito/Teclado): Ancho completo (w-full) en móvil, fijo a lg:w-96 en escritorio.

Esta ficha técnica asegura que cualquier elemento nuevo añadido o modificado siga la misma estructura visual y jerarquía del diseño existente.
