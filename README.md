# 🎰 VickyLuna - Ruleta Interactiva

Aplicación web de ruleta interactiva con backend serverless en Netlify y base de datos en Airtable.

## 🚀 Deployment en Netlify desde GitHub

### 1. Preparar el repositorio en GitHub

1. Crea un nuevo repositorio en GitHub (puede ser público o privado)
2. Desde la terminal, ejecuta estos comandos en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Initial commit - VickyLuna Ruleta"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/xvickyluna.git
git push -u origin main
```

### 2. Configurar Airtable

Necesitas tener una base de Airtable con las siguientes tablas:

**Tabla: Configuraciones**
- ID (Text)
- Nombre (Text)
- Titulo (Text)
- Premios (Long text) - Lista separada por comas
- Colores (Long text) - Lista separada por comas

**Tabla: Códigos**
- ID (Text)
- Codigo (Text)
- Tiros (Number)
- Estado (Single select: 'activo', 'vencido', 'gastado')
- FechaExpiracion (Date)

### 3. Obtener credenciales de Airtable

1. Ve a https://airtable.com/account
2. Copia tu **API Key** (o crea un Personal Access Token)
3. Abre tu base de Airtable
4. La URL tendrá este formato: `https://airtable.com/appXXXXXXXXXXXXXX/...`
5. El **Base ID** es la parte que dice `appXXXXXXXXXXXXXX`

### 4. Deploy en Netlify

1. Ve a https://app.netlify.com/
2. Click en "Add new site" → "Import an existing project"
3. Selecciona "GitHub" y autoriza la conexión
4. Busca y selecciona tu repositorio `xvickyluna`
5. Configuración del build:
   - **Build command:** (dejar vacío o `echo 'No build step'`)
   - **Publish directory:** `.` (punto)
   - **Functions directory:** `netlify/functions` (se detecta automáticamente)

6. Antes de hacer deploy, click en "Add environment variables"
7. Agrega estas variables:
   - `AIRTABLE_API_KEY`: tu API key de Airtable
   - `AIRTABLE_BASE_ID`: tu Base ID de Airtable

8. Click en "Deploy site"

### 5. Configurar el dominio

1. Una vez deployado, Netlify te dará un dominio como: `https://random-name-123456.netlify.app`
2. Puedes cambiarlo en: Site settings → Domain management → Options → Edit site name
3. Cambia el nombre a: `xvickyluna` (si está disponible)
4. Tu sitio quedará en: `https://xvickyluna.netlify.app`

### 6. Actualizar la URL en el código

Si cambias el nombre del sitio, actualiza la URL en [index.html](index.html):
```html
<meta property="og:url" content="https://xvickyluna.netlify.app/" />
```

## 🛠️ Desarrollo Local

Para probar localmente:

1. Instala las dependencias:
```bash
npm install
```

2. Crea un archivo `.env` (copia de `.env.example`):
```bash
AIRTABLE_API_KEY=tu_api_key_aqui
AIRTABLE_BASE_ID=tu_base_id_aqui
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre http://localhost:8888

## 📁 Estructura del Proyecto

```
xvickyluna/
├── index.html              # Página principal de la ruleta
├── admin.html              # Panel de administración
├── package.json            # Dependencias del proyecto
├── netlify.toml           # Configuración de Netlify
├── .env.example           # Ejemplo de variables de entorno
└── netlify/
    └── functions/         # Funciones serverless
        ├── config-manager.js
        ├── create-code.js
        ├── delete-code.js
        ├── validate-code.js
        └── utils/
            └── airtable.js # Utilidades de Airtable
```

## 🎯 Funcionalidades

- ✨ Validación de códigos exclusivos
- 🎰 Ruleta interactiva con premios personalizables
- 📊 Panel de administración para gestionar códigos
- 🎨 Diseño responsive y moderno
- 🔒 Autenticación para el panel de admin
- 📱 Compatible con móviles y tablets

## 🔐 Acceso al Panel de Administración

El panel de administración está en: `https://xvickyluna.netlify.app/admin.html`

La contraseña por defecto debe configurarse en el código de [admin.html](admin.html).

## 📝 Notas Importantes

- Los códigos tienen sistema de expiración automática
- Cada código tiene un número limitado de tiros
- Los premios se configuran desde Airtable
- Las funciones serverless se ejecutan automáticamente en Netlify

## 🆘 Soporte

Si tienes problemas con el deployment:
1. Revisa los logs en Netlify: Site → Deploys → Click en el deploy → Functions logs
2. Verifica que las variables de entorno estén correctamente configuradas
3. Asegúrate de que tu base de Airtable tenga la estructura correcta

---

💖 Hecho con amor para VickyLuna
