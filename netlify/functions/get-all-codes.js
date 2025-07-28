const { table, premiosStringToArray } = require('./utils/airtable');

exports.handler = async (event, context) => {
    // Configurar headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    // Solo permitir método GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        // Obtener todos los registros de la tabla
        const records = await table.select({
            // Removemos el sort por fecha ya que ese campo no existe en Airtable
        }).all();

        // Formatear los registros para el frontend
        const formattedCodes = records.map(record => {
            // Obtener el string de premios de Airtable y convertirlo a array
            const premiosString = record.get('Premios') || '';
            const premiosArray = premiosStringToArray(premiosString);

            return {
                id: record.id, // ID interno de Airtable
                codigoId: record.get('ID'), // Campo ID personalizado
                nombre: record.get('Nombre Fan') || '',
                premios: premiosArray, // Array de premios convertido desde string
                usado: record.get('Usado') || false,
                fechaUso: record.get('Fecha Uso') || null
            };
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: formattedCodes,
                total: formattedCodes.length
            })
        };

    } catch (error) {
        console.error('Error al obtener códigos:', error);
        
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
