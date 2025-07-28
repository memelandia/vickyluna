const Airtable = require('airtable');

const {
    AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID,
    AIRTABLE_TABLE_NAME
} = process.env;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    throw new Error('Las variables de entorno de Airtable son requeridas.');
}

Airtable.configure({ apiKey: AIRTABLE_API_KEY });

const base = Airtable.base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_NAME);

const premiosStringToArray = (premiosStr) => {
    if (!premiosStr || typeof premiosStr !== 'string') return [];
    return premiosStr.split(',').map(p => p.trim()).filter(Boolean);
};

const premiosArrayToString = (premiosArr) => {
    if (!premiosArr || !Array.isArray(premiosArr)) return '';
    return premiosArr.join(', ');
};

module.exports = { 
    table, 
    premiosStringToArray, 
    premiosArrayToString 
};
