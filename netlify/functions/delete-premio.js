exports.handler = async (event, context) => {
    // Configurar CORS
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

    // Solo aceptar métodos DELETE
    if (event.httpMethod !== 'DELETE') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Método no permitido. Use DELETE.'
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

        // Parsear el body de la petición
        const { id } = JSON.parse(event.body);

        // Validar que se envió el ID
        if (!id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'ID del premio es requerido.'
                })
            };
        }

        // Verificar que queden al menos 1 premio después de eliminar
        const countResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Premios`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!countResponse.ok) {
            throw new Error(`Error al verificar premios existentes: ${countResponse.status}`);
        }

        const countData = await countResponse.json();
        const premiosExistentes = countData.records.filter(record => 
            record.fields.Nombre && record.fields.Nombre.trim() !== ''
        );

        if (premiosExistentes.length <= 1) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Debe haber al menos 1 premio en la ruleta. No se puede eliminar el último premio.'
                })
            };
        }

        // Eliminar el premio
        const deleteResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Premios?records[]=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!deleteResponse.ok) {
            if (deleteResponse.status === 404) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Premio no encontrado.'
                    })
                };
            }
            throw new Error(`Error al eliminar premio: ${deleteResponse.status}`);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Premio eliminado exitosamente'
            })
        };

    } catch (error) {
        console.error('Error al eliminar premio:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Error interno del servidor al eliminar el premio'
            })
        };
    }
};
