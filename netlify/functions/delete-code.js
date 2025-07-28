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

        // Guardar información del código antes de eliminarlo
        const deletedCodeInfo = {
            id: record.id,
            codigoId: record.get('ID'),
            nombre: record.get('Nombre Fan'),
            premios: premiosStringToArray(record.get('Premios')),
            usado: record.get('Usado'),
            fechaUso: record.get('Fecha Uso') || null
        };

        // Eliminar el registro de Airtable
        await table.destroy([record.id]);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Código eliminado exitosamente',
                data: deletedCodeInfo
            })
        };

    } catch (error) {
        console.error('Error al eliminar código:', error);
        
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
