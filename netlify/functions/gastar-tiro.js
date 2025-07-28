const { table } = require('./utils/airtable');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Método no permitido' }) };
    }

    try {
        const { codigoId } = JSON.parse(event.body);
        
        if (!codigoId) {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'El campo codigoId es requerido.' }) };
        }

        // Buscar el registro del código
        const records = await table.select({
            maxRecords: 1,
            filterByFormula: `{ID} = '${codigoId}'`
        }).firstPage();

        if (records.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'Código no encontrado' }) };
        }

        const record = records[0];
        const tiradasRestantesActuales = record.fields['Tiradas Restantes'] || 0;

        if (tiradasRestantesActuales <= 0) {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'No quedan tiradas disponibles' }) };
        }

        // Calcular nuevas tiradas restantes
        const nuevasTiradasRestantes = tiradasRestantesActuales - 1;
        
        // Preparar datos a actualizar
        const updateData = {
            'Tiradas Restantes': nuevasTiradasRestantes
        };

        // Si llega a 0, marcar como usado
        if (nuevasTiradasRestantes === 0) {
            updateData['Usado'] = true;
        }

        // Actualizar el registro
        await table.update(record.id, updateData);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Tiro gastado exitosamente',
                tiradasRestantes: nuevasTiradasRestantes,
                codigoExpirado: nuevasTiradasRestantes === 0
            })
        };

    } catch (error) {
        console.error('Error al gastar tiro:', error);
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
