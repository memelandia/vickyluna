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
        const { codigoId, nombreFan, premios } = JSON.parse(event.body);

        // Validar campos requeridos
        if (!codigoId || !nombreFan || !premios || !Array.isArray(premios)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Datos inválidos',
                    message: 'Los campos codigoId, nombreFan y premios (array) son requeridos'
                })
            };
        }

        // Verificar si el código ya existe
        const existingRecords = await table.select({
            filterByFormula: `{ID} = "${codigoId}"`
        }).all();

        if (existingRecords.length > 0) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código duplicado',
                    message: `El código ${codigoId} ya existe`
                })
            };
        }

        // Crear el nuevo registro
        const newRecord = await table.create([
            {
                fields: {
                    'ID': codigoId,
                    'Nombre Fan': nombreFan,
                    'Premios': premios,
                    'Usado': false,
                    'Fecha Creacion': new Date().toISOString()
                }
            }
        ]);

        // Formatear la respuesta
        const createdCode = {
            id: newRecord[0].id,
            codigoId: newRecord[0].get('ID'),
            nombre: newRecord[0].get('Nombre Fan'),
            premios: newRecord[0].get('Premios'),
            usado: newRecord[0].get('Usado'),
            fechaCreacion: newRecord[0].get('Fecha Creacion')
        };

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Código creado exitosamente',
                data: createdCode
            })
        };

    } catch (error) {
        console.error('Error al crear código:', error);
        
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
