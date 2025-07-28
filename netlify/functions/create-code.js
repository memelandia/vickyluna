const { table, premiosArrayToString, premiosStringToArray } = require('./utils/airtable');

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
            maxRecords: 1,
            filterByFormula: `{ID} = "${codigoId}"`
        }).firstPage();

        // Convertir array de premios a string para Airtable
        const premiosString = premiosArrayToString(premios);

        let resultRecord;
        let isUpdate = false;

        if (existingRecords.length > 0) {
            // El código existe, actualizar el registro existente
            const existingRecord = existingRecords[0];
            
            const updatedRecords = await table.update([
                {
                    id: existingRecord.id,
                    fields: {
                        'Nombre Fan': nombreFan,
                        'Premios': premiosString,
                        'Usado': false, // Resetear a false para permitir reutilización
                        'Fecha Uso': null // Limpiar fecha de uso anterior
                    }
                }
            ]);
            
            resultRecord = updatedRecords[0];
            isUpdate = true;
        } else {
            // El código no existe, crear nuevo registro
            const newRecords = await table.create([
                {
                    fields: {
                        'ID': codigoId,
                        'Nombre Fan': nombreFan,
                        'Premios': premiosString,
                        'Usado': false,
                    }
                }
            ]);
            
            resultRecord = newRecords[0];
            isUpdate = false;
        }

        // Formatear la respuesta convirtiendo el string de premios de vuelta a array
        const responseCode = {
            id: resultRecord.id,
            codigoId: resultRecord.get('ID'),
            nombre: resultRecord.get('Nombre Fan'),
            premios: premiosStringToArray(resultRecord.get('Premios')),
            usado: resultRecord.get('Usado'),
            fechaCreacion: resultRecord.get('Fecha Creacion'),
            fechaUso: resultRecord.get('Fecha Uso')
        };

        return {
            statusCode: isUpdate ? 200 : 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: isUpdate ? 'Código actualizado exitosamente' : 'Código creado exitosamente',
                data: responseCode,
                operation: isUpdate ? 'update' : 'create'
            })
        };

    } catch (error) {
        console.error('Error al crear/actualizar código:', error);
        
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