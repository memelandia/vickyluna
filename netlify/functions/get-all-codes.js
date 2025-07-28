const { table, premiosStringToArray } = require('./utils/airtable');

exports.handler = async () => {
    const headers = { 'Access-Control-Allow-Origin': '*' };
    try {
        const records = await table.select().all();
        const formattedCodes = records.map((record) => ({
            codigoId: record.fields.ID,
            nombre: record.fields['Nombre Fan'],
            premios: premiosStringToArray(record.fields.Premios),
            usado: record.fields.Usado || false
        }));
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: formattedCodes }) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Error al obtener códigos: ' + error.message }) };
    }
};