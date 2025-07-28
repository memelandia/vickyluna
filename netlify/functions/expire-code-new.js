const { table } = require('./utils/airtable');

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
        const { codigo } = JSON.parse(event.body);

        if (!codigo) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código requerido'
                })
            };
        }

        const records = await table.select({
            maxRecords: 1,
            filterByFormula: `{ID} = "${codigo}"`
        }).firstPage();

        if (records.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código no encontrado'
                })
            };
        }

        const record = records[0];

        await table.update([
            {
                id: record.id,
                fields: {
                    'Usado': true,
                    'Fecha Uso': new Date().toISOString()
                }
            }
        ]);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Código marcado como usado'
            })
        };

    } catch (error) {
        console.error('Error expiring code:', error);
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
