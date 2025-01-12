const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod === 'POST') {
        try {
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
                const response = await fetch(body.url);
                const data = await response.text();

                const baseUrl = new URL(body.url).origin;
                const proxiedData = data.replace(
                    /(href|src|action)=["']([^"']+)["']/g,
                    (match, attr, value) => {
                        if (value.startsWith('http') || value.startsWith('//')) {
                            return `${attr}="${value}"`;
                        }
                        return `${attr}="https://goodcalculator.netlify.app/.netlify/functions/proxy?url=${encodeURIComponent(baseUrl + value)}"`;
                    }
                );

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': response.headers.get('Content-Type') || 'text/html'
                    },
                    body: proxiedData
                };
            }
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: error.message })
            };
        }
    }

    if (event.httpMethod === 'GET') {
        const url = event.queryStringParameters.url;

        if (!url) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'URL parameter is required' })
            };
        }

        try {
            const response = await fetch(url);
            const data = await response.text();

            const baseUrl = new URL(url).origin;
            const proxiedData = data.replace(
                /(href|src|action)=["']([^"']+)["']/g,
                (match, attr, value) => {
                    if (value.startsWith('http') || value.startsWith('//')) {
                        return `${attr}="${value}"`;
                    }
                    return `${attr}="https://goodcalculator.netlify.app/.netlify/functions/proxy?url=${encodeURIComponent(baseUrl + value)}"`;
                }
            );

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': response.headers.get('Content-Type') || 'text/html'
                },
                body: proxiedData
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' })
    };
};