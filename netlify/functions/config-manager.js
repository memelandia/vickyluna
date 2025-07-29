const Airtable = require('airtable');

// Funciones auxiliares para manejo de premios
function premiosStringToArray(premiosString) {
    if (!premiosString || typeof premiosString !== 'string') {
        return [];
    }
    return premiosString.split(',').map(p => p.trim()).filter(p => p.length > 0);
}

function premiosArrayToString(premiosArray) {
    if (!Array.isArray(premiosArray)) {
        return '';
    }
    return premiosArray.map(p => p.trim()).filter(p => p.length > 0).join(',');
}

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
            // ===== OBTENER CONFIGURACIÓN COMPLETA =====
            try {
                const records = await configTable.select({
                    maxRecords: 1
                }).firstPage();

                if (records.length === 0) {
                    // Si no hay configuración, crear una por defecto
                    const premiosPorDefecto = 'Premio Sorpresa,Pack Fotos Hot,Videollamada 5 minutos,Contenido Exclusivo,Chat Privado,Foto Personalizada';
                    
                    const newRecord = await configTable.create({
                        'avatarURL': '',
                        'Nombre Modelo': 'Scarlet Lucy',
                        'Premios': premiosPorDefecto
                    });

                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            data: {
                                avatarURL: '',
                                nombreModelo: 'Scarlet Lucy',
                                premios: premiosStringToArray(premiosPorDefecto)
                            }
                        })
                    };
                }

                const record = records[0];
                const avatarURL = record.get('avatarURL') || '';
                const nombreModelo = record.get('Nombre Modelo') || 'Scarlet Lucy';
                const premiosString = record.get('Premios') || 'Premio Sorpresa,Pack Fotos Hot,Videollamada 5 minutos';
                const premios = premiosStringToArray(premiosString);

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        data: {
                            avatarURL,
                            nombreModelo,
                            premios
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
                        message: 'Error al cargar la configuración: ' + error.message
                    })
                };
            }
        }

        if (event.httpMethod === 'POST') {
            // ===== ACTUALIZAR CONFIGURACIÓN =====
            const body = JSON.parse(event.body);
            const { nuevaAvatarURL, nuevoNombreModelo, nuevaListaPremios } = body;

            try {
                // Buscar el registro de configuración existente
                const records = await configTable.select({
                    maxRecords: 1
                }).firstPage();

                let recordId;
                if (records.length === 0) {
                    // Crear nuevo registro si no existe
                    const premiosPorDefecto = nuevaListaPremios ? premiosArrayToString(nuevaListaPremios) : 'Premio Sorpresa,Pack Fotos Hot,Videollamada 5 minutos';
                    
                    const newRecord = await configTable.create({
                        'avatarURL': nuevaAvatarURL || '',
                        'Nombre Modelo': nuevoNombreModelo || 'Scarlet Lucy',
                        'Premios': premiosPorDefecto
                    });
                    recordId = newRecord.id;
                } else {
                    // Actualizar registro existente
                    recordId = records[0].id;
                    const updateFields = {};
                    
                    if (nuevaAvatarURL !== undefined) {
                        updateFields['avatarURL'] = nuevaAvatarURL;
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
                        
                        // Validar caracteres permitidos
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
                    
                    if (nuevaListaPremios !== undefined) {
                        // Validar lista de premios
                        if (!Array.isArray(nuevaListaPremios)) {
                            return {
                                statusCode: 400,
                                headers,
                                body: JSON.stringify({
                                    success: false,
                                    message: 'La lista de premios debe ser un array'
                                })
                            };
                        }
                        
                        if (nuevaListaPremios.length > 10) {
                            return {
                                statusCode: 400,
                                headers,
                                body: JSON.stringify({
                                    success: false,
                                    message: 'No se pueden tener más de 10 premios'
                                })
                            };
                        }
                        
                        // Validar cada premio
                        for (let premio of nuevaListaPremios) {
                            if (!premio || typeof premio !== 'string' || premio.trim().length === 0) {
                                return {
                                    statusCode: 400,
                                    headers,
                                    body: JSON.stringify({
                                        success: false,
                                        message: 'Todos los premios deben tener un nombre válido'
                                    })
                                };
                            }
                            
                            if (premio.trim().length > 50) {
                                return {
                                    statusCode: 400,
                                    headers,
                                    body: JSON.stringify({
                                        success: false,
                                        message: 'Los nombres de premios no pueden tener más de 50 caracteres'
                                    })
                                };
                            }
                        }
                        
                        updateFields['Premios'] = premiosArrayToString(nuevaListaPremios);
                    }

                    if (Object.keys(updateFields).length > 0) {
                        await configTable.update(recordId, updateFields);
                    }
                }

                // Obtener configuración actualizada para devolver
                const updatedRecord = await configTable.find(recordId);
                const avatarURL = updatedRecord.get('avatarURL') || '';
                const nombreModelo = updatedRecord.get('Nombre Modelo') || 'Scarlet Lucy';
                const premiosString = updatedRecord.get('Premios') || '';
                const premios = premiosStringToArray(premiosString);

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Configuración actualizada exitosamente',
                        data: {
                            avatarURL,
                            nombreModelo,
                            premios
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
                        message: 'Error al guardar la configuración: ' + error.message
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
                message: 'Error interno del servidor: ' + error.message
            })
        };
    }
};
