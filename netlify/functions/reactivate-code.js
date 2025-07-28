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

        // PASO 1: Buscar el registro usando nuestro ID personalizado
        console.log(`Buscando código para reactivar: ${codigoId}`);
        const searchRecords = await table.select({
            maxRecords: 1, // Solo necesitamos uno
            filterByFormula: `{ID} = "${codigoId}"`
        }).firstPage();

        // Verificar si el código existe
        if (searchRecords.length === 0) {
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

        // PASO 2: Obtener el registro encontrado y su ID interno de Airtable
        const foundRecord = searchRecords[0];
        const airtableInternalId = foundRecord.id; // Este es el ID interno (rec...)
        
        console.log(`Código encontrado. ID interno de Airtable: ${airtableInternalId}`);

        // PASO 3: Reactivar el código (sin preguntas, siempre cumplir la orden)
        console.log(`Reactivando código ${codigoId} - marcando como disponible`);
        const updateResult = await table.update([
            {
                id: airtableInternalId, // Usar el ID interno de Airtable
                fields: {
                    'Usado': false,
                    'Fecha Uso': null // Limpiar la fecha de uso
                }
            }
        ]);

        // Verificar que la actualización fue exitosa
        if (!updateResult || updateResult.length === 0) {
            throw new Error('La actualización no devolvió resultados');
        }

        const updatedRecord = updateResult[0];
        console.log(`Código ${codigoId} reactivado exitosamente`);

        // Formatear la respuesta
        const reactivatedCode = {
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
                message: `Código ${codigoId} reactivado exitosamente`,
                data: reactivatedCode
            })
        };

    } catch (error) {
        console.error('Error crítico al reactivar código:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor',
                message: `Error al procesar la reactivación: ${error.message}`
            })
        };
    }
};
