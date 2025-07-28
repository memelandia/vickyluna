const Airtable = require('airtable');
const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    throw new Error('Variables de entorno de Airtable son requeridas.');
}

Airtable.configure({ apiKey: AIRTABLE_API_KEY });
const base = Airtable.base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_NAME);

// Funciones de ayuda consistentes para todo el backend
const premiosStringToArray = (premiosStr) => (premiosStr || '').split(',').map(p => p.trim()).filter(Boolean);
const premiosArrayToString = (premiosArr) => (premiosArr || []).join(', ');

module.exports = { table, premiosStringToArray, premiosArrayToString };
