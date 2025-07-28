const Airtable = require('airtable');

exports.handler = async (event, context) => {
    // Configurar headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Manejar preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight OK' })
        };
    }

    try {
        // Configurar conexión a Airtable
        const base = new Airtable({
            apiKey: process.env.AIRTABLE_API_KEY
        }).base(process.env.AIRTABLE_BASE_ID);

        const configTable = base('Configuraciones');

        if (event.httpMethod === 'GET') {
            // ===== OBTENER CONFIGURACIÓN =====
            try {
                const records = await configTable.select({
                    maxRecords: 1
                }).firstPage();

                if (records.length === 0) {
                    // Si no hay configuración, crear una por defecto
                    const newRecord = await configTable.create({
                        'Avatar URL': '',
                        'Nombre Modelo': 'Scarlet Lucy'
                    });

                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            data: {
                                avatarURL: '',
                                nombreModelo: 'Scarlet Lucy'
                            }
                        })
                    };
                }

                const record = records[0];
                const avatarURL = record.get('Avatar URL') || '';
                const nombreModelo = record.get('Nombre Modelo') || 'Scarlet Lucy';

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        data: {
                            avatarURL,
                            nombreModelo
                        }
                    })
                };

            } catch (error) {
                console.error('Error al obtener configuración:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Error al cargar la configuración'
                    })
                };
            }
        }

        if (event.httpMethod === 'POST') {
            // ===== ACTUALIZAR CONFIGURACIÓN =====
            const { nuevaAvatarURL, nuevoNombreModelo } = JSON.parse(event.body);

            try {
                // Buscar el registro de configuración existente
                const records = await configTable.select({
                    maxRecords: 1
                }).firstPage();

                let recordId;
                if (records.length === 0) {
                    // Crear nuevo registro si no existe
                    const newRecord = await configTable.create({
                        'Avatar URL': nuevaAvatarURL || '',
                        'Nombre Modelo': nuevoNombreModelo || 'Scarlet Lucy'
                    });
                    recordId = newRecord.id;
                } else {
                    // Actualizar registro existente
                    recordId = records[0].id;
                    const updateFields = {};
                    
                    if (nuevaAvatarURL !== undefined) {
                        updateFields['Avatar URL'] = nuevaAvatarURL;
                    }
                    
                    if (nuevoNombreModelo !== undefined) {
                        // Validación del nombre en el backend
                        const nombreLimpio = nuevoNombreModelo.trim();
                        if (nombreLimpio.length === 0) {
                            return {
                                statusCode: 400,
                                headers,
                                body: JSON.stringify({
                                    success: false,
                                    message: 'El nombre no puede estar vacío'
                                })
                            };
                        }
                        
                        if (nombreLimpio.length > 25) {
                            return {
                                statusCode: 400,
                                headers,
                                body: JSON.stringify({
                                    success: false,
                                    message: 'El nombre no puede tener más de 25 caracteres'
                                })
                            };
                        }
                        
                        // Validar caracteres permitidos (letras, números, espacios y algunos caracteres especiales)
                        if (!/^[a-zA-Z0-9\s\u00C0-\u017F\-\.]+$/.test(nombreLimpio)) {
                            return {
                                statusCode: 400,
                                headers,
                                body: JSON.stringify({
                                    success: false,
                                    message: 'El nombre contiene caracteres no permitidos. Solo se permiten letras, números, espacios, guiones y puntos'
                                })
                            };
                        }
                        
                        updateFields['Nombre Modelo'] = nombreLimpio;
                    }

                    if (Object.keys(updateFields).length > 0) {
                        await configTable.update(recordId, updateFields);
                    }
                }

                // Obtener configuración actualizada para devolver
                const updatedRecord = await configTable.find(recordId);
                const avatarURL = updatedRecord.get('Avatar URL') || '';
                const nombreModelo = updatedRecord.get('Nombre Modelo') || 'Scarlet Lucy';

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Configuración actualizada exitosamente',
                        data: {
                            avatarURL,
                            nombreModelo
                        }
                    })
                };

            } catch (error) {
                console.error('Error al actualizar configuración:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Error al guardar la configuración'
                    })
                };
            }
        }

        // Método no permitido
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Método no permitido'
            })
        };

    } catch (error) {
        console.error('Error general en config-manager:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Error interno del servidor'
            })
        };
    }
};
