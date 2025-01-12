const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body);

        if (body.action === 'validateCredentials') {
            const { username, password } = body;
            if (username === 'glisand' && password === '0721454511112222') {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ success: true })
                };
            } else {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ success: false, message: 'Invalid credentials' })
                };
            }
        }

        if (body.action === 'proxyRequest' && body.url) {
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