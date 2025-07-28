const { table, premiosArrayToString } = require('./utils/airtable');

exports.handler = async (event) => {
    const headers = { 'Access-Control-Allow-Origin': '*' };
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Método no permitido' }) };

    try {
        const { codigoId, nombreFan, premios } = JSON.parse(event.body);
        if (!codigoId || !nombreFan || !premios) {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Faltan datos requeridos.' }) };
        }

        const totalTiradas = premios.length;
        const data = {
            "ID": codigoId,
            "Nombre Fan": nombreFan,
            "Premios": premiosArrayToString(premios),
            "Tiradas Totales": totalTiradas,
            "Tiradas Restantes": totalTiradas,
            "Usado": false
        };
        const existingRecords = await table.select({ maxRecords: 1, filterByFormula: `{ID} = '${codigoId}'` }).firstPage();
        
        const operation = existingRecords.length > 0 ? 'update' : 'create';
        if (operation === 'update') {
            await table.update(existingRecords[0].id, data);
        } else {
            await table.create([{ fields: data }]);
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Código ${operation}d con éxito`, operation }) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Error en el servidor: ' + error.message }) };
    }
};