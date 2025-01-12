exports.handler = async (event) => {
    if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body);
        if (body.expression === '0721+4545*1111/2222') {
            return {
                statusCode: 200,
                body: JSON.stringify({ popup: true })
            };
        } else if (body.url) {
            try {
                const response = await fetch(body.url);
                const data = await response.text();
                return {
                    statusCode: 200,
                    body: JSON.stringify({ success: true, data: data })
                };
            } catch (error) {
                return {
                    statusCode: 500,
                    body: JSON.stringify({ success: false, error: error.message })
                };
            }
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Invalid request' })
    };
};