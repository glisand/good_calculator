const fetch = require('node-fetch');

exports.handler = async (event) => {
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