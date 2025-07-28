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
        const { nombre } = JSON.parse(event.body);

        // Validar que se envió el nombre
        if (!nombre || nombre.trim() === '') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'El nombre del premio es requerido.'
                })
            };
        }

        const nombreLimpio = nombre.trim();

        // Verificar el límite actual de premios
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

        // Verificar límite de 10 premios
        if (premiosExistentes.length >= 10) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Límite de 10 premios alcanzado. Elimina un premio antes de añadir uno nuevo.'
                })
            };
        }

        // Verificar si el premio ya existe
        const premioExiste = premiosExistentes.some(record => 
            record.fields.Nombre.toLowerCase().trim() === nombreLimpio.toLowerCase()
        );

        if (premioExiste) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Ya existe un premio con ese nombre.'
                })
            };
        }

        // Crear el nuevo premio
        const createResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Premios`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                records: [{
                    fields: {
                        Nombre: nombreLimpio
                    }
                }]
            })
        });

        if (!createResponse.ok) {
            throw new Error(`Error al crear premio: ${createResponse.status}`);
        }

        const createData = await createResponse.json();
        const nuevoPremio = createData.records[0];

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Premio creado exitosamente',
                data: {
                    id: nuevoPremio.id,
                    nombre: nuevoPremio.fields.Nombre
                }
            })
        };

    } catch (error) {
        console.error('Error al crear premio:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Error interno del servidor al crear el premio'
            })
        };
    }
};
