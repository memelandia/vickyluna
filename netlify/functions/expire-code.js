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
        console.log(`Buscando código: ${codigoId}`);
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

        // Verificar el estado actual antes de actualizar
        const currentStatus = foundRecord.get('Usado');
        console.log(`Estado actual del código: ${currentStatus}`);

        // Verificar si el código ya está usado
        if (currentStatus === true) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código ya expirado',
                    message: `El código ${codigoId} ya estaba marcado como usado`,
                    fechaUso: foundRecord.get('Fecha Uso')
                })
            };
        }

        // PASO 3: Actualizar el registro usando el ID interno correcto
        console.log(`Actualizando código ${codigoId} a estado usado`);
        const updateResult = await table.update([
            {
                id: airtableInternalId, // Usar el ID interno de Airtable
                fields: {
                    'Usado': true,
                    'Fecha Uso': new Date().toISOString()
                }
            }
        ]);

        // Verificar que la actualización fue exitosa
        if (!updateResult || updateResult.length === 0) {
            throw new Error('La actualización no devolvió resultados');
        }

        const updatedRecord = updateResult[0];
        console.log(`Código ${codigoId} actualizado exitosamente`);

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
                message: `Código ${codigoId} marcado como usado exitosamente`,
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
