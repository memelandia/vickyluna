const { table, premiosStringToArray } = require('./utils/airtable');

exports.handler = async () => {
    try {
        const records = await table.select().all();
        const formattedCodes = records.map((record) => ({
            id: record.id,
            codigoId: record.fields.ID,
            nombre: record.fields['Nombre Fan'],
            premios: premiosStringToArray(record.fields.Premios),
            usado: record.fields.Usado || false
        }));
        return { statusCode: 200, body: JSON.stringify({ success: true, data: formattedCodes }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Error al obtener códigos: ' + error.message }) };
    }
};
