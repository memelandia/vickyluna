const { table } = require('./utils/airtable');

exports.handler = async (event, context) => {
    // Configurar headers CORS (esto está bien como lo tenías)
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
            maxRecords: 1, // Más eficiente, solo necesitamos saber si existe al menos uno
            filterByFormula: `{ID} = "${codigoId}"`
        }).firstPage();

        if (existingRecords.length > 0) {
            return {
                statusCode: 409, // 409 Conflict es más semántico para "ya existe"
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Código duplicado',
                    message: `El código ${codigoId} ya existe. No se puede crear de nuevo. Bórralo o reactívalo.`
                })
            };
        }

        // ==============================================================
        // ===              INICIO DE LA CORRECCIÓN CLAVE             ===
        // ==============================================================

        // 1. Convertimos el array de premios en un string simple separado por comas.
        //    Airtable en un campo de texto no entiende arrays, pero sí entiende este formato.
        const premiosAsString = premios.join(', ');

        // 2. Preparamos los datos para enviar. Usamos los nombres exactos de las columnas de Airtable.
        const fieldsToCreate = {
            'ID': codigoId,
            'Nombre Fan': nombreFan,
            'Premios': premiosAsString, // Enviamos el string convertido
            'Usado': false
            // La fecha de creación es manejada automáticamente por Airtable si la columna existe.
        };

        // Crear el nuevo registro usando la estructura correcta
        const newRecords = await table.create([
            {
                fields: fieldsToCreate
            }
        ]);

        const newRecord = newRecords[0];

        // ==============================================================
        // ===                FIN DE LA CORRECCIÓN CLAVE              ===
        // ==============================================================
        
        // Formatear la respuesta (igual que lo tenías, adaptado a la nueva forma de recibir premios)
        const createdCode = {
            id: newRecord.id,
            codigoId: newRecord.get('ID'),
            nombre: newRecord.get('Nombre Fan'),
            // Como Airtable nos devuelve un string, lo devolvemos como un array para mantener la consistencia
            premios: newRecord.get('Premios').split(', '), 
            usado: newRecord.get('Usado'),
        };

        return {
            statusCode: 201, // 201 Created es el código estándar para creación exitosa
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Código creado exitosamente',
                data: createdCode
            })
        };

    } catch (error) {
        console.error('Error al crear código:', error);
        
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