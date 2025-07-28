// delete-code.js
const { table } = require('./utils/airtable');
exports.handler = async (event) => {
    if (event.httpMethod !== 'DELETE') return { statusCode: 405, body: JSON.stringify({ success: false, message: 'Método no permitido' })};
    try {
        const { codigoId } = JSON.parse(event.body);
        const records = await table.select({ maxRecords: 1, filterByFormula: `{ID} = '${codigoId}'` }).firstPage();
        if (records.length === 0) return { statusCode: 404, body: JSON.stringify({ success: false, message: 'Código no encontrado para eliminar' }) };
        await table.destroy(records[0].id);
        return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Código eliminado con éxito.' }) };
    } catch (error) { return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Error en el servidor: ' + error.message }) }; }
};