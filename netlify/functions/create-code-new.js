const { table, premiosArrayToString } = require('./utils/airtable');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        const { codigoId, nombreFan, premios } = JSON.parse(event.body);

        if (!codigoId || !nombreFan || !premios || !Array.isArray(premios)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Datos inválidos'
                })
            };
        }

        const existingRecords = await table.select({
            maxRecords: 1,
            filterByFormula: `{ID} = "${codigoId}"`
        }).firstPage();

        if (existingRecords.length > 0) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'El código ya existe'
                })
            };
        }

        const records = await table.create([
            {
                fields: {
                    'ID': codigoId,
                    'Nombre Fan': nombreFan,
                    'Premios': premiosArrayToString(premios),
                    'Usado': false
                }
            }
        ]);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Código creado exitosamente',
                data: {
                    id: records[0].id,
                    codigo: records[0].fields.ID,
                    nombreFan: records[0].fields['Nombre Fan'],
                    premios: premiosStringToArray(records[0].fields.Premios),
                    usado: records[0].fields.Usado
                }
            })
        };

    } catch (error) {
        console.error('Error creating code:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor'
            })
        };
    }
};
