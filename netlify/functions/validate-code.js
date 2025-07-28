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

        // Buscar el código en Airtable usando .firstPage() para mayor eficiencia
        const records = await table.select({
            maxRecords: 1,
            filterByFormula: `{ID} = "${codigoId}"`
        }).firstPage();

        // Caso 1: Código no encontrado
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
        const usado = record.get('Usado');

        // Caso 2: Código ya usado - statusCode 403 exacto
        if (usado === true) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código expirado',
                    message: `El código ${codigoId} ya ha sido utilizado y ha expirado`,
                    fechaUso: record.get('Fecha Uso')
                })
            };
        }

        // Caso 3: Código válido y disponible - usar premiosStringToArray
        const validCode = {
            id: record.id,
            codigoId: record.get('ID'),
            nombre: record.get('Nombre Fan'),
            premios: premiosStringToArray(record.get('Premios')),
            usado: record.get('Usado'),
            fechaUso: record.get('Fecha Uso') || null
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Código válido y disponible',
                data: validCode
            })
        };

    } catch (error) {
        console.error('Error al validar código:', error);
        
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
