const { table } = require('./utils/airtable');

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

        // Verificar si el código ya está activo
        if (record.get('Usado') === false) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código ya activo',
                    message: `El código ${codigoId} ya estaba marcado como activo`
                })
            };
        }

        // Actualizar el registro para reactivarlo
        const updatedRecord = await table.update([
            {
                id: record.id,
                fields: {
                    'Usado': false,
                    'Fecha Uso': null // Limpiar la fecha de uso
                }
            }
        ]);

        // Formatear la respuesta
        const reactivatedCode = {
            id: updatedRecord[0].id,
            codigoId: updatedRecord[0].get('ID'),
            nombre: updatedRecord[0].get('Nombre Fan'),
            premios: updatedRecord[0].get('Premios'),
            usado: updatedRecord[0].get('Usado'),
            fechaCreacion: updatedRecord[0].get('Fecha Creacion')
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Código reactivado exitosamente',
                data: reactivatedCode
            })
        };

    } catch (error) {
        console.error('Error al reactivar código:', error);
        
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
