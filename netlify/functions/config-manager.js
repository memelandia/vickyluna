const { table, premiosStringToArray, premiosArrayToString } = require('./utils/airtable');

// La tabla 'Configuraciones' debe tener los campos: 'Nombre Modelo' (Single line text), 'avatarURL' (Long text), 'Premios' (Long text)
// y una única fila de registro.

exports.handler = async (event) => {
    const headers = { 'Access-Control-Allow-Origin': '*' };
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

    const configTable = table; // Asumimos que utils/airtable está apuntando a 'Configuraciones'

    try {
        // Obtenemos siempre la primera (y única) fila de configuración.
        const records = await configTable.select({ maxRecords: 1 }).firstPage();
        
        let record;
        // Si no existe ninguna fila de configuración, la creamos con valores por defecto.
        if (records.length === 0) {
            const newRecord = await configTable.create([{
                fields: {
                    'Nombre Modelo': 'Nombre por Defecto',
                    'avatarURL': '',
                    'Premios': 'Premio A, Premio B, Premio C'
                }
            }]);
            record = newRecord[0];
        } else {
            record = records[0];
        }
        
        const recordId = record.id; // ID interno de Airtable (ej: recXXXXXXXX)

        // LÓGICA GET
        if (event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: {
                        nombreModelo: record.fields['Nombre Modelo'],
                        avatarURL: record.fields.avatarURL || '',
                        premios: premiosStringToArray(record.fields.Premios)
                    }
                })
            };
        }

        // LÓGICA POST
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            const { nuevoNombreModelo, nuevaAvatarURL, nuevaListaPremios } = body;
            const fieldsToUpdate = {};

            // Construir el objeto de actualización solo con los campos que se enviaron
            if (nuevoNombreModelo !== undefined) fieldsToUpdate['Nombre Modelo'] = nuevoNombreModelo;
            if (nuevaAvatarURL !== undefined) fieldsToUpdate['avatarURL'] = nuevaAvatarURL;
            if (nuevaListaPremios !== undefined) fieldsToUpdate['Premios'] = premiosArrayToString(nuevaListaPremios);

            // Si hay algo que actualizar, procedemos
            if (Object.keys(fieldsToUpdate).length > 0) {
                await configTable.update(recordId, fieldsToUpdate);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Configuración actualizada con éxito.' })
            };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Método no permitido' }) };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Error en el servidor: ' + error.message
            })
        };
    }
};
