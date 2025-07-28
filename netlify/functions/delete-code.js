const { table, premiosStringToArray } = require('./utils/airtable');

exports.handler = async (event, context) => {
    // Configurar headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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

    // Solo permitir método DELETE
    if (event.httpMethod !== 'DELETE') {
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
        console.log(`Buscando código para eliminar: ${codigoId}`);
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

        // Guardar información del código antes de eliminarlo
        const deletedCodeInfo = {
            id: foundRecord.id,
            codigoId: foundRecord.get('ID'),
            nombre: foundRecord.get('Nombre Fan'),
            premios: premiosStringToArray(foundRecord.get('Premios')),
            usado: foundRecord.get('Usado'),
            fechaUso: foundRecord.get('Fecha Uso') || null
        };

        // PASO 3: Eliminar el registro usando el ID interno correcto
        console.log(`Eliminando código ${codigoId} con ID interno ${airtableInternalId}`);
        await table.destroy([airtableInternalId]);
        console.log(`Código ${codigoId} eliminado exitosamente`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `Código ${codigoId} eliminado exitosamente`,
                data: deletedCodeInfo
            })
        };

    } catch (error) {
        console.error('Error crítico al eliminar código:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor',
                message: `Error al procesar la eliminación: ${error.message}`
            })
        };
    }
};
