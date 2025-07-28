const { table, premiosStringToArray } = require('./utils/airtable');

exports.handler = async (event) => {
    const headers = { 'Access-Control-Allow-Origin': '*' };
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Método no permitido' }) };
    
    try {
        const { codigoId } = JSON.parse(event.body);
        if (!codigoId) return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'El campo codigoId es requerido.' }) };
        
        const records = await table.select({ maxRecords: 1, filterByFormula: `{ID} = '${codigoId}'` }).firstPage();
        if (records.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'Código no encontrado' }) };
        }
        
        const codeData = records[0].fields;
        if (codeData.Usado) {
            return { statusCode: 403, headers, body: JSON.stringify({ success: false, message: 'Este código ya ha sido utilizado' }) };
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    nombreFan: codeData['Nombre Fan'],
                    premios: premiosStringToArray(codeData.Premios),
                    tiradasRestantes: codeData['Tiradas Restantes'] || 0
                }
            })
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Error en el servidor: ' + error.message }) };
    }
};