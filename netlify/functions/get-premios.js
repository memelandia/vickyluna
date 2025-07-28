exports.handler = async (event, context) => {
    // Configurar CORS
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

    // Solo aceptar métodos GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Método no permitido. Use GET.'
            })
        };
    }

    try {
        const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
        const BASE_ID = process.env.AIRTABLE_BASE_ID;

        if (!AIRTABLE_API_KEY || !BASE_ID) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Variables de entorno de Airtable no configuradas'
                })
            };
        }

        // Llamar a la API de Airtable para obtener todos los premios
        const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Premios`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error de Airtable: ${response.status}`);
        }

        const data = await response.json();
        
        // Transformar los datos para el frontend
        const premios = data.records.map(record => ({
            id: record.id,
            nombre: record.fields.Nombre || ''
        })).filter(premio => premio.nombre.trim() !== ''); // Filtrar premios vacíos

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: premios,
                count: premios.length
            })
        };

    } catch (error) {
        console.error('Error al obtener premios:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Error interno del servidor al obtener premios'
            })
        };
    }
};
