1 # Crear el archivo en el directorio actual
   2 cat > instrucciones-ia-migracion.md << 'EOF'
   3 # 🤖 **Instrucciones para IA: Integración de Configuración en Proyecto Existente**
  🎯 Instrucciones para IA: Integración de Configuración a Proyecto React Existente

  📋 Descripción de la Tarea
  La IA debe ayudar a integrar una configuración completa de React con Arquitectura Limpia, Atomic Design y herramientas Qwen CLI en un proyecto React ya existente e iniciado.

  🚨 Puntos CRÍTICOS a Considerar

  1. SEGURIDAD PRIMERO
   - Siempre sugerir hacer backup: git add . && git commit -m "Backup antes de integrar nueva configuración"
   - Siempre crear una rama temporal: git checkout -b integrar-configuracion
   - Nunca sobrescribir archivos sin antes avisar del riesgo

  2. PASOS SECUENCIALES
   - No intentar hacer todo de una vez
   - Verificar que cada paso funcione antes de continuar
   - Validar que el proyecto siga funcionando después de cada paso

  🔧 PASO 1: Análisis del Proyecto Actual

  1.1. Verificar estructura actual

   1 # Solicitar al usuario que comparta su estructura
   2 find . -maxdepth 2 -type d | grep -v node_modules | head -20

  1.2. Identificar configuraciones actuales
   - ¿Usa Vite o Webpack?
   - ¿Tiene TypeScript y cómo está configurado?
   - ¿Usa Tailwind o otro sistema de estilos?
   - ¿Tiene tests y qué framework?
   - ¿Tiene imports absolutos con alias?

  📁 PASO 2: Copiar Configuraciones Base

  2.1. Copiar archivos de configuración (orden importante)
   - tsconfig.json (adapta paths si existen)
   - vite.config.ts (integra con configuración actual)
   - biome.json (adapta a estilo existente)
   - tailwind.config.ts (combina con configuración actual)
   - vitest.config.ts (si no hay tests, crear desde cero)

  2.2. Actualizar package.json
   - Solo añadir nuevas dependencias, NO eliminar existentes
   - Actualizar versiones si son significativamente mejores
   - Mantener scripts existentes, añadir nuevos
   - Verificar compatibilidad de dependencias

  ⚙️ PASO 3: Adaptación Gradual

  3.1. Estructura de Carpetas
   - Si proyecto actual tiene estructura diferente, mantenerla inicialmente
   - Crear directorios nuevos: src/shared/ui/{atoms,molecules,organisms,templates}
   - Migrar componentes gradualmente, no todo de una vez

  3.2. Imports y Rutas
   - Si proyecto usa @/components, mantener esos alias
   - Adaptar tsconfig.json para incluir alias existentes
   - Añadir nuevos alias sin eliminar los antiguos

  3.3. Componentes Existentes
   - No reemplazar componentes existentes
   - Crear nuevos componentes con nueva estructura
   - Ir migrando componentes uno por uno gradualmente

  🧪 PASO 4: Validación Continua

  4.1. Comandos a probar en cada paso

   1 # Después de cada cambio importante
   2 npm install
   3 npm run type-check  # Siempre debe pasar
   4 npm run lint        # Siempre debe pasar
   5 npm run dev         # Debe iniciar sin errores
   6 npm run build       # Siempre debe funcionar

  4.2. Tests
   - Si proyecto tiene tests existentes, asegurar que sigan pasando
   - Añadir nuevos tests siguiendo nuevo patrón
   - No eliminar tests existentes

  🎨 PASO 5: Adaptación de Estilo y UI

  5.1. Tailwind CSS
   - Si proyecto ya usa Tailwind, mantener estilos actuales
   - Añadir nuevas utilidades sin eliminar existentes
   - Adaptar el globals.css para incluir variables nuevas

  5.2. Componentes Compartidos
   - Mantener componentes existentes
   - Crear nuevos componentes con patrones de shadcn/ui
   - Establecer convenio para usar nuevos o migrar de a poco

  🚀 PASO 6: Activación de Nuevas Funcionalidades

  6.1. Comandos nuevos
   - Activar npm run test:ui una vez todo el setup funcione
   - Activar Qwen CLI cuando proyecto esté estable
   - Activar Husky hooks cuando todo funcione bien

  6.2. Scripts útiles a sugerir

   1 # Validar que todo sigue funcionando
   2 npm run type-check && npm run lint && npm run test && npm run dev

  ⚠️ ERRORES COMUNES A AVOIDAR

   1. No sobrescribir configuraciones críticas
   2. No eliminar dependencias que el proyecto actual necesita
   3. No cambiar estructura de componentes sin migrar primero
   4. No activar herramientas nuevas si proyecto base no funciona
   5. No forzar la migración si hay conflictos graves

  ✅ CRITERIOS DE ÉXITO

   - [ ] Proyecto existente sigue funcionando perfectamente
   - [ ] Nuevas herramientas se pueden usar sin problemas
   - [ ] No se rompe funcionalidad existente
   - [ ] Tests existentes siguen pasando
   - [ ] Se puede usar npm run test:ui exitosamente
   - [ ] Se puede usar npm run dev sin errores
   - [ ] Se puede usar npm run build sin problemas

  🛠️ EJEMPLO DE INTEGRACIÓN GRADUAL

  Si el usuario dice: "Tengo un proyecto con Vite + React + TypeScript"
   1. Primero: Copiar tsconfig.json adaptando paths
   2. Segundo: Actualizar vite.config.ts integrando nuevos alias
   3. Tercero: Añadir dependencias nuevas
   4. Cuarto: Probar npm run dev
   5. Quinto: Añadir tailwind config combinando con existente
   6. Sexto: Probar npm run build
   7. Séptimo: Añadir tests y probar npm run test:ui

  📝 COMUNICACIÓN CON USUARIO

   - Siempre explicar qué vas a hacer antes de hacerlo
   - Preguntar si pueden hacer backup antes de cambios
   - Ofrecer opciones para distintos casos
   - Si hay conflicto, sugerir solución gradual
   - No forzar la migración si no es apropiada en ese momento

   1 EOF
