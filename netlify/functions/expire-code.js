const { table, premiosStringToArray } = require('./utils/airtable');

exports.handler = async (event, context) => {
    // Configurar headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Solo permitir método POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        // Parsear el cuerpo de la petición
        const { codigoId } = JSON.parse(event.body);

        // Validar que se proporcionó el código
        if (!codigoId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código requerido',
                    message: 'El campo codigoId es requerido'
                })
            };
        }

        // Buscar el código en Airtable
        const records = await table.select({
            filterByFormula: `{ID} = "${codigoId}"`
        }).all();

        // Verificar si el código existe
        if (records.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código no encontrado',
                    message: `El código ${codigoId} no existe`
                })
            };
        }

        const record = records[0];

        // Verificar si el código ya está usado
        if (record.get('Usado') === true) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código ya expirado',
                    message: `El código ${codigoId} ya estaba marcado como usado`
                })
            };
        }

        // Actualizar el registro para marcarlo como usado
        const updatedRecord = await table.update([
            {
                id: record.id,
                fields: {
                    'Usado': true,
                    'Fecha Uso': new Date().toISOString()
                }
            }
        ]);

        // Formatear la respuesta
        const expiredCode = {
            id: updatedRecord[0].id,
            codigoId: updatedRecord[0].get('ID'),
            nombre: updatedRecord[0].get('Nombre Fan'),
            premios: premiosStringToArray(updatedRecord[0].get('Premios')),
            usado: updatedRecord[0].get('Usado'),
            fechaCreacion: updatedRecord[0].get('Fecha Creacion'),
            fechaUso: updatedRecord[0].get('Fecha Uso')
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Código marcado como usado exitosamente',
                data: expiredCode
            })
        };

    } catch (error) {
        console.error('Error al expirar código:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            })
        };
    }
};
