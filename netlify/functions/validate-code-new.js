const { table, premiosStringToArray } = require('./utils/airtable');

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
                    valido: false,
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
                    valido: false,
                    error: 'Código no encontrado'
                })
            };
        }

        const record = records[0];

        if (record.fields.Usado) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    valido: false,
                    error: 'Código ya utilizado',
                    fechaUso: record.fields['Fecha Uso']
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                valido: true,
                data: {
                    nombreFan: record.fields['Nombre Fan'],
                    premios: premiosStringToArray(record.fields.Premios)
                }
            })
        };

    } catch (error) {
        console.error('Error validating code:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                valido: false,
                error: 'Error interno del servidor'
            })
        };
    }
};
