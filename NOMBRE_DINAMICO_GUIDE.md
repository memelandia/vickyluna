# 🎨 **GUÍA: NOMBRE DINÁMICO DE LA MODELO**

## 📋 **Resumen de la Implementación**

Se ha implementado un sistema completo que permite a la modelo cambiar su nombre principal que aparece en la ruleta directamente desde el panel de administración, con validaciones robustas y persistencia en Airtable.

---

## 🏗️ **CONFIGURACIÓN PREVIA EN AIRTABLE**

### **Paso 1: Crear la columna en Airtable**
1. Ve a tu base "Ruleta Mágica" en Airtable
2. Abre la tabla **"Configuraciones"**
3. Haz clic en el **"+"** para añadir una nueva columna
4. Configura la columna:
   - **Name:** `Nombre Modelo`
   - **Type:** `Single line text`
5. En la primera (y única) fila, escribe: **"Scarlet Lucy"** (o el nombre que prefieras como predeterminado)

### **Paso 2: Verificar estructura de la tabla**
Tu tabla "Configuraciones" ahora debe tener al menos estas columnas:
- `Avatar URL` (Single line text)
- `Nombre Modelo` (Single line text)

---

## 🚀 **COMPONENTES IMPLEMENTADOS**

### **1. Backend - config-manager.js**
- **Función:** Netlify Function que gestiona toda la configuración visual
- **Endpoints:**
  - `GET` → Obtiene configuración actual (avatar y nombre)
  - `POST` → Actualiza configuración (acepta avatar y/o nombre)
- **Validaciones del backend:**
  - Nombre no vacío
  - Máximo 25 caracteres
  - Solo letras, números, espacios, guiones y puntos
  - Caracteres especiales con acentos permitidos (español)

### **2. Frontend - admin.html**
- **Nueva sección:** "🎨 Personalización Visual"
- **Funcionalidades:**
  - Campo de texto para el nombre (máximo 25 caracteres)
  - Campo para URL del avatar (validación de formato)
  - Botones para guardar cada configuración por separado
  - Validaciones del lado del cliente
  - Notificaciones de éxito/error
  - Carga automática de valores actuales al abrir el panel

### **3. Frontend - index.html**
- **Carga dinámica:** El nombre se obtiene del backend al cargar la página
- **Actualización automática:** El título del navegador también se actualiza
- **Fallback seguro:** Si no se puede cargar, usa "Scarlet Lucy" por defecto

---

## 🎯 **CÓMO USAR LA FUNCIONALIDAD**

### **Para la Administradora:**
1. **Acceder al panel:** Ir a `admin.html` y hacer login
2. **Buscar sección:** Desplazarse hasta "🎨 Personalización Visual"
3. **Cambiar nombre:**
   - Escribir el nuevo nombre en el campo "Nombre a mostrar en la ruleta"
   - Hacer clic en "💎 Guardar Nombre" o presionar Enter
4. **Verificar cambio:** El sistema mostrará una notificación de éxito
5. **Ver resultado:** Ir a `index.html` para ver el nuevo nombre en la ruleta

### **Validaciones automáticas:**
- ✅ **Caracteres permitidos:** Letras, números, espacios, guiones (-), puntos (.), acentos
- ✅ **Longitud:** Entre 1 y 25 caracteres
- ✅ **Ejemplos válidos:** "Scarlet Lucy", "María-José", "Camila2024", "Ana.Rose"
- ❌ **Ejemplos inválidos:** "", "Nombre@", "NombreMuyLargoQueExcedeLosLímites"

---

## 🔧 **FUNCIONES PRINCIPALES**

### **admin.html - Funciones JavaScript:**
```javascript
cargarConfiguracion()          // Carga configuración al inicializar panel
guardarNombreModelo()         // Guarda nuevo nombre con validaciones
guardarAvatarUrl()            // Guarda nueva URL de avatar
```

### **index.html - Funciones JavaScript:**
```javascript
cargarConfiguracionVisual()   // Carga y aplica configuración visual
```

### **config-manager.js - Endpoints:**
```javascript
GET  /.netlify/functions/config-manager    // Obtener configuración
POST /.netlify/functions/config-manager    // Actualizar configuración
```

---

## 📊 **ESTRUCTURA DE DATOS**

### **Petición POST al backend:**
```json
{
  "nuevoNombreModelo": "Nuevo Nombre",
  "nuevaAvatarURL": "https://ejemplo.com/avatar.jpg"
}
```

### **Respuesta del backend:**
```json
{
  "success": true,
  "message": "Configuración actualizada exitosamente",
  "data": {
    "nombreModelo": "Nuevo Nombre",
    "avatarURL": "https://ejemplo.com/avatar.jpg"
  }
}
```

---

## 🛡️ **VALIDACIONES Y SEGURIDAD**

### **Validaciones del Cliente (JavaScript):**
- Longitud del nombre (1-25 caracteres)
- Expresión regular para caracteres permitidos
- Formato URL para avatares

### **Validaciones del Servidor (Node.js):**
- Sanitización de entrada
- Validación robusta de caracteres
- Límites de longitud estrictos
- Manejo de errores completo

### **Seguridad:**
- CORS configurado correctamente
- Validación dual (cliente + servidor)
- Escapado de caracteres especiales en HTML
- Manejo seguro de errores

---

## 🚨 **RESOLUCIÓN DE PROBLEMAS**

### **Error: "El nombre contiene caracteres no permitidos"**
- **Causa:** Uso de caracteres especiales no válidos
- **Solución:** Usar solo letras, números, espacios, guiones y puntos

### **Error: "El nombre no puede tener más de 25 caracteres"**
- **Causa:** Nombre demasiado largo
- **Solución:** Acortar el nombre a 25 caracteres o menos

### **Error: "Error al cargar configuración"**
- **Causa:** Problema de conexión o configuración de Airtable
- **Solución:** Verificar tabla "Configuraciones" en Airtable y columnas

### **El nombre no aparece en la ruleta**
- **Causa:** Caché del navegador o error de carga
- **Solución:** Refrescar la página o verificar consola del navegador

---

## 🎉 **BENEFICIOS DE LA IMPLEMENTACIÓN**

✅ **Flexibilidad total:** La modelo puede cambiar su nombre cuando quiera
✅ **Validación robusta:** Previene errores y caracteres problemáticos
✅ **Experiencia fluida:** Interfaz intuitiva con feedback inmediato
✅ **Persistencia confiable:** Datos guardados en Airtable de forma segura
✅ **Fallback seguro:** Sistema funciona aunque falle la carga
✅ **Multiuso:** Base para futuras personalizaciones (avatar, colores, etc.)

---

## 📝 **NOTAS TÉCNICAS**

- **Compatibilidad:** Funciona en todos los navegadores modernos
- **Performance:** Carga asíncrona sin bloquear la interfaz
- **Escalabilidad:** Fácil añadir más opciones de personalización
- **Mantenimiento:** Código modular y bien documentado

---

¡El sistema de nombre dinámico está completamente implementado y listo para usar! 🎨✨
