# RECOM_POS.md

## ⭐️ Proyecto: RECOOM POS (Sistema de Punto de Venta para Abarrotes Multi-Sucursal)

Este documento define la estructura y las especificaciones funcionales finales para el desarrollo de RECOOM POS, una aplicación especializada en la gestión de abarrotes con un modelo de inventario distribuido: **Bodega Central**, **Tienda 1** y **Tienda 2**.

---

##IMPORTANTE POR AHORA FIREBASE NO SE USARA SOLO DE FORMA LOCAL PERSISTANTE EN NAV, CUANDO SE ELIMINE ESTE COMENTARIO SERA HORA DE MIGRAR A FI
REBASE


## 1. Stack Tecnológico

| Componente | Tecnología | Notas de Desarrollo |
| :--- | :--- | :--- |
| **Frontend** | React (SPA) | Vite para desarrollo rápido y *build*. |
| **Estilo** | Tailwind CSS | Uso de `lucide-react` para iconografía. |
| **Backend** | Firebase | **Firestore** (Base de datos principal), **Authentication** (Roles y acceso), **Storage** (Comprobantes de gastos). |
| **Estado Global** | Redux Toolkit / Zustand | Necesario para gestionar el *stock* distribuido y el carrito de POS en tiempo real. |
| **Despliegue** | PWA (Progressive Web App) | Crucial para la funcionalidad de **Escaneo Móvil** (cámara). |

---

## 2. Estructura de Módulos (Rutas Principales)

La aplicación debe ser modular. El `src/App.jsx` actúa como el *router* principal, utilizando `ProtectedRoutes` para aplicar restricciones de rol.

| Módulo/Ruta | Rol Principal | Funcionalidades Clave |
| :--- | :--- | :--- |
| **`/login`** | Todos | Autenticación y verificación de rol/tienda asignada. |
| **`/pos/:storeId`** | Cajera | Interfaz de venta rápida, Corte de Caja, Escaneo Móvil (cámara). |
| **`/inventory`** | Gerente, Admin | Catálogo de productos, Stock por Ubicación, Modal de Consumo de Empleados. |
| **`/transfers`** | Gerente, Admin | Creación y confirmación de Órdenes de Traslado (OT) entre Bodega/Tiendas. |
| **`/purchases`** | Gerente, Admin | Órdenes de Compra (OC), Gestión de Proveedores, **Modal de Compras Misceláneas**. |
| **`/reports`** | Gerente, Admin | Reportes de Utilidad, Ventas por Tienda, Movimientos de Inventario (incluyendo Mermas). |
| **`/admin`** | Admin | Configuración de usuarios, roles, impuestos y categorías. |

---

## 3. Especificaciones Funcionales Clave

### 3.1. Inventario Distribuido y Traslados

* **Stock por Ubicación:** Firestore debe manejar el inventario como colecciones o documentos que referencien la `ubicacion_id` (`Bodega`, `Tienda 1`, `Tienda 2`).
* **Categorización:** El inventario se clasifica por **Categoría/Subcategoría**. El **Filtro Principal para Stock Bajo** debe ser la Categoría Padre, utilizada para agrupar productos por **Proveedor**.
* **Órdenes de Traslado (OT):** Flujo de 3 pasos: **Creación (Gerente/Admin)** $\rightarrow$ **Confirmación de Envío (Origen)** $\rightarrow$ **Confirmación de Recepción (Destino)** con registro de faltantes/ajustes.

### 3.2. Gestión de Personal y Roles 🔒

| Rol | Permiso de Acceso | Funcionalidad Crítica |
| :--- | :--- | :--- |
| **Cajera** | POS de su tienda asignada. | Venta, Devoluciones, Corte de Caja. |
| **Gerente** | POS, Inventario (su tienda), Traslados, Compras, Reportes (su tienda). | **Acceso a Consumo de Empleados**, Creación de OC/Traslados. |
| **Admin** | Acceso Total (Configuración, Reportes Consolidados, Inventario global). | Configuración de Usuarios/Roles, Acceso a Módulo `Admin`. |
| **Consumo Empleados** | **Modal Exclusivo (Gerente/Admin).** Permite registrar una salida de inventario instantánea, marcada como **"Egreso por Consumo"**, utilizando el **Costo Promedio Ponderado (CPP)** del producto. |

### 3.3. Compras y Gastos (Misceláneas) 💸

* **Modal de Lista de Compras Misceláneas:** Implementación como un *modal* rápido (`src/features/purchases/MiscellaneousPurchaseModal.jsx`).
    * **Registro:** Ingreso de Producto/Concepto, Cantidad, Costo Unitario y **Ubicación de Destino**.
    * **Impacto:** El sistema debe clasificar si es **Gasto Operativo** (solo registro financiero) o **Producto Inventariable** (incrementa stock).
    * **Comprobante:** Subida opcional de imagen/PDF del recibo a **Firebase Storage**.

### 3.4. Experiencia de Usuario y Tecnología

* **Escaneo Móvil:** El componente `ScannerComponent.jsx` (integrado en el POS y Toma de Inventario) debe usar la cámara del dispositivo vía la API de la PWA para leer códigos de barras (librería JS como ZXing).
* **Ticket Moderno:** El POS debe generar un *ticket* con la opción de incluir un **Código QR** para la consulta digital del comprobante.

---

## 4. Convenciones de Desarrollo (Vite/React)

* **Organización de Código:** Seguir la estructura **Feature-Sliced Design** (ver Sección 2 de la respuesta anterior).
* **Firebase Integration:** Toda interacción con Firebase debe encapsularse en la carpeta `src/firebase/` y exponerse a través de `src/api/`. Los componentes solo llaman a las funciones de `api/`.
* **Styling:** Utilizar clases de **Tailwind CSS** de manera consistente y crear componentes base en `src/components/ui/`.