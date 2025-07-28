const Airtable = require('airtable');

// Cargar variables de entorno
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Codigos';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

// Validar que las variables de entorno están configuradas
if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Las variables de entorno AIRTABLE_BASE_ID y AIRTABLE_API_KEY son requeridas');
}

// Configurar Airtable
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: AIRTABLE_API_KEY
});

// Inicializar la base y tabla
const base = Airtable.base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_NAME);

// Función utilitaria para convertir premios de string a array
function premiosStringToArray(premiosString) {
    if (!premiosString || typeof premiosString !== 'string') {
        return [];
    }
    return premiosString.split(', ').filter(premio => premio.trim() !== '');
}

// Función utilitaria para convertir premios de array a string
function premiosArrayToString(premiosArray) {
    if (!Array.isArray(premiosArray)) {
        return '';
    }
    return premiosArray.filter(premio => premio && premio.trim() !== '').join(', ');
}

// Exportar la instancia de la tabla y utilidades para uso en otras funciones
module.exports = {
    table,
    base,
    AIRTABLE_TABLE_NAME,
    premiosStringToArray,
    premiosArrayToString
};
