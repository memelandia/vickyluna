const Airtable = require('airtable');

// Configurar conexión a Airtable usando las variables de entorno principales
const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

// Tabla de configuraciones (nombre fijo)
const table = base('Configuraciones');

// FUNCIONES DE AYUDA EXPORTADAS PARA MANTENER LA CONSISTENCIA
const premiosStringToArray = (premiosStr) => {
    if (!premiosStr || typeof premiosStr !== 'string') return [];
    return premiosStr.split(',').map(p => p.trim()).filter(Boolean);
};

const premiosArrayToString = (premiosArr) => {
    if (!premiosArr || !Array.isArray(premiosArr)) return '';
    return premiosArr.join(',');
};

module.exports = { 
    table, 
    premiosStringToArray, 
    premiosArrayToString 
};