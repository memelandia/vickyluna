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

        console.log(`Expirando código: ${codigoId}`);

        // Buscar el registro en Airtable usando filterByFormula
        const records = await table.select({
            maxRecords: 1,
            filterByFormula: `{ID} = "${codigoId}"`
        }).firstPage();

        // Si no se encuentra el código, devolver error 404
        if (records.length === 0) {
            console.log(`Código ${codigoId} no encontrado`);
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código no encontrado',
                    message: `El código ${codigoId} no existe en la base de datos`
                })
            };
        }

        // Obtener el registro encontrado y su ID interno de Airtable
        const foundRecord = records[0];
        const airtableInternalId = foundRecord.id; // Este es el ID interno (rec...)
        
        console.log(`Código encontrado. Expirando inmediatamente...`);

        // Llamar a table.update usando el ID interno para establecer Usado = true
        // SIN PREGUNTAS - cumplir la orden de expirar
        const updateResult = await table.update([
            {
                id: airtableInternalId,
                fields: {
                    'Usado': true,
                    'Fecha Uso': new Date().toISOString()
                }
            }
        ]);

        const updatedRecord = updateResult[0];
        console.log(`Código ${codigoId} expirado exitosamente`);

        // Formatear la respuesta
        const expiredCode = {
            id: updatedRecord.id,
            codigoId: updatedRecord.get('ID'),
            nombre: updatedRecord.get('Nombre Fan'),
            premios: premiosStringToArray(updatedRecord.get('Premios')),
            usado: updatedRecord.get('Usado'),
            fechaUso: updatedRecord.get('Fecha Uso')
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `Código ${codigoId} expirado permanentemente`,
                data: expiredCode
            })
        };

    } catch (error) {
        console.error('Error crítico al expirar código:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor',
                message: `Error al procesar la expiración: ${error.message}`
            })
        };
    }
};
