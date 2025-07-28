exports.handler = async (event, context) => {
    // Configurar CORS
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

    // Solo aceptar métodos POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Método no permitido. Use POST.'
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
        const { id, nuevoNombre } = JSON.parse(event.body);

        // Validar que se enviaron los datos requeridos
        if (!id || !nuevoNombre || nuevoNombre.trim() === '') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'ID del premio y nuevo nombre son requeridos.'
                })
            };
        }

        const nombreLimpio = nuevoNombre.trim();

        // Verificar si ya existe otro premio con el mismo nombre
        const checkResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Premios`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!checkResponse.ok) {
            throw new Error(`Error al verificar premios existentes: ${checkResponse.status}`);
        }

        const checkData = await checkResponse.json();
        const premioExiste = checkData.records.some(record => 
            record.id !== id && // Excluir el premio que estamos editando
            record.fields.Nombre && 
            record.fields.Nombre.toLowerCase().trim() === nombreLimpio.toLowerCase()
        );

        if (premioExiste) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Ya existe otro premio con ese nombre.'
                })
            };
        }

        // Actualizar el premio
        const updateResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Premios`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                records: [{
                    id: id,
                    fields: {
                        Nombre: nombreLimpio
                    }
                }]
            })
        });

        if (!updateResponse.ok) {
            if (updateResponse.status === 404) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Premio no encontrado.'
                    })
                };
            }
            throw new Error(`Error al actualizar premio: ${updateResponse.status}`);
        }

        const updateData = await updateResponse.json();
        const premioActualizado = updateData.records[0];

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Premio actualizado exitosamente',
                data: {
                    id: premioActualizado.id,
                    nombre: premioActualizado.fields.Nombre
                }
            })
        };

    } catch (error) {
        console.error('Error al editar premio:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Error interno del servidor al editar el premio'
            })
        };
    }
};
