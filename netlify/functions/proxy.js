const fetch = require('node-fetch');
const { URL } = require('url');

function replaceUrlsWithProxy(content, baseUrl) {
    const urlPatterns = [
        /(href=")(\/[^"]*)/g,
        /(src=")(\/[^"]*)/g,
        /(url\()([^)]*)/g,
    ];

    for (const pattern of urlPatterns) {
        content = content.replace(pattern, (match, prefix, url) => {
            const fullUrl = new URL(url, baseUrl).toString();
            return `${prefix}/.netlify/functions/proxy?url=${encodeURIComponent(fullUrl)}`;
        });
    }

    return content;
}

exports.handler = async (event) => {
    const url = event.queryStringParameters.url;
    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'URL parameter is required' }),
        };
    }

    const baseUrl = new URL(url).origin;

    try {
        // リクエストヘッダーにホスト名を設定
        const headers = {
            ...event.headers,
            Host: new URL(url).hostname, // ホスト名を正しく設定
        };

        const response = await fetch(url, {
            method: event.httpMethod,
            headers: headers,
            body: event.httpMethod === 'POST' ? event.body : undefined,
        });

        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('text/html') || contentType.includes('text/css') || contentType.includes('application/javascript')) {
            const text = await response.text();
            data = replaceUrlsWithProxy(text, baseUrl);
        } else {
            data = await response.buffer();
        }

        return {
            statusCode: response.status,
            headers: {
                'Content-Type': contentType,
            },
            body: data,
        };
    } catch (error) {
        console.error('Proxy error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
};