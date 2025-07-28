# 🎯 Sistema de Gestión Dinámica de Premios

## 📋 Instrucciones para la Administradora

### Paso 1: Crear la Tabla "Premios" en Airtable

1. **Accede a tu base de datos en Airtable**
2. **Crea una nueva tabla:**
   - **Nombre de la tabla:** `Premios`
   - **Columna principal:** `Nombre` (tipo: Single line text)
3. **Guarda los cambios**

### Paso 2: Poblado Inicial (Opcional)

Puedes añadir algunos premios iniciales directamente desde Airtable o usar el panel de administración una vez implementado.

**Ejemplos de premios sugeridos:**
- 🔥 SEXTING 15 MINUTOS
- 📸 PACK FOTOS HOT
- 🎬 PACK VIDEOS HOT
- 🎁 PREMIO SORPRESA
- 💋 VIDEO LESBICO EXCLUSIVO

## 🔧 Funcionalidades Implementadas

### ✅ **Backend - Nuevas Netlify Functions**

#### 📖 **get-premios.js**
- **Método:** GET
- **Función:** Obtiene todos los premios de la tabla "Premios"
- **Respuesta:** Lista de premios con ID y nombre

#### ➕ **add-premio.js**
- **Método:** POST
- **Función:** Añade un nuevo premio
- **Validaciones:**
  - Límite máximo de 10 premios
  - No permite nombres duplicados
  - Nombre requerido y no vacío

#### ✏️ **edit-premio.js**
- **Método:** POST
- **Función:** Edita el nombre de un premio existente
- **Validaciones:**
  - Verifica que el premio existe
  - No permite nombres duplicados con otros premios

#### 🗑️ **delete-premio.js**
- **Método:** DELETE
- **Función:** Elimina un premio específico
- **Validaciones:**
  - Debe quedar al menos 1 premio en la ruleta
  - Verifica que el premio existe

### 🎨 **Frontend - Panel de Administración**

#### **Nueva Sección: "Gestionar Premios de la Ruleta"**

**Características:**
- **Campo de texto** para añadir nuevos premios
- **Botón "Añadir Premio"** con contador (ej: "Añadir Premio (7/10)")
- **Lista dinámica** de premios existentes
- **Botones de edición** y eliminación para cada premio
- **Límite visual** cuando se alcanzan 10 premios

**Funcionalidades:**
- ✅ **Añadir premios:** Click en "Añadir Premio" o Enter en el campo
- ✅ **Editar premios:** Click en "✏️ Editar" abre prompt para cambiar nombre
- ✅ **Eliminar premios:** Click en "🗑️ Eliminar" con confirmación elegante
- ✅ **Límite dinámico:** Botón se deshabilita automáticamente al llegar a 10
- ✅ **Actualización automática:** Selector de premios se actualiza al crear códigos

### 🎲 **Frontend - Ruleta del Usuario**

**Mejoras implementadas:**
- ✅ **Carga dinámica:** Los premios se cargan automáticamente del backend
- ✅ **Ruleta adaptativa:** Se dibuja según los premios configurados
- ✅ **Sincronización total:** Cambios en admin.html se reflejan inmediatamente
- ✅ **Manejo de errores:** Notificaciones elegantes si no se pueden cargar premios

## 🚀 **Beneficios del Sistema**

### Para la Administradora:
1. **🎯 Control Total:** Gestiona los premios sin tocar código
2. **⚡ Cambios Instantáneos:** Modificaciones se reflejan inmediatamente
3. **🔒 Límites Seguros:** Sistema previene errores (máx 10, mín 1)
4. **📱 Interfaz Intuitiva:** Botones claros y confirmaciones elegantes

### Para los Usuarios:
1. **🎨 Experiencia Consistente:** Ruleta siempre actualizada
2. **🔄 Sin Interrupciones:** Cambios se aplican sin afectar la experiencia
3. **📊 Premios Reales:** Solo ven premios actualmente disponibles

## 📝 **Instrucciones de Uso**

### **Añadir un Premio:**
1. Escribe el nombre del premio en el campo de texto
2. Click en "Añadir Premio" o presiona Enter
3. El premio aparecerá en la lista inmediatamente

### **Editar un Premio:**
1. Click en "✏️ Editar" junto al premio que deseas cambiar
2. Escribe el nuevo nombre en el prompt
3. Click "OK" para confirmar

### **Eliminar un Premio:**
1. Click en "🗑️ Eliminar" junto al premio
2. Confirma la eliminación en el modal elegante
3. El premio se eliminará permanentemente

### **Crear Códigos con Nuevos Premios:**
1. Los premios se actualizan automáticamente en el selector
2. Selecciona los premios deseados normalmente
3. El sistema valida que hay suficientes premios para las tiradas

## ⚠️ **Validaciones y Límites**

### **Límites del Sistema:**
- **Máximo:** 10 premios simultáneos
- **Mínimo:** 1 premio (no se puede eliminar el último)
- **Caracteres:** Sin límite específico, pero se recomienda nombres concisos

### **Validaciones Automáticas:**
- ✅ **Nombres únicos:** No permite premios duplicados
- ✅ **Campos requeridos:** No permite premios vacíos
- ✅ **Sincronización:** Frontend y backend siempre coherentes

## 🛠️ **Solución de Problemas**

### **Si no cargan los premios:**
1. Verifica que la tabla "Premios" existe en Airtable
2. Asegúrate de que tiene la columna "Nombre"
3. Recarga la página del panel de administración

### **Si no se pueden añadir premios:**
1. Verifica que no has alcanzado el límite de 10
2. Asegúrate de que el nombre no está duplicado
3. Verifica tu conexión a internet

### **Si la ruleta no se dibuja:**
1. Asegúrate de que hay al menos 1 premio configurado
2. Verifica tu conexión a internet
3. Recarga la página de la ruleta

## 🎉 **Resultado Final**

¡Tu aplicación ahora es completamente dinámica! La administradora puede:
- ✅ **Gestionar premios** sin conocimiento técnico
- ✅ **Ver cambios instantáneos** en tiempo real
- ✅ **Controlar la experiencia** del usuario final
- ✅ **Mantener la ruleta actualizada** siempre

**¡El sistema es ahora 100% profesional y autogestionable!** 🚀✨
