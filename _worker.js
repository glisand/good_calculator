addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/auth' && request.method === 'POST') {
        try {
            const { username, password } = await request.json();

            if (username === 'glisand' && password === '0721454511112222') {
                return new Response(JSON.stringify({ success: true }), {
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                return new Response(JSON.stringify({ success: false, message: '認証失敗' }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 401,
                });
            }
        } catch (error) {
            return new Response(JSON.stringify({ success: false, message: '無効なリクエスト' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            });
        }
    } else if (path === '/proxy') {
        const targetUrl = url.searchParams.get('url') || 'https://yandex.com';

        try {
            const response = await fetch(targetUrl, { method: 'GET' });
            const contentType = response.headers.get('Content-Type');
            let data;

            if (contentType.includes('text/html')) {
                const text = await response.text();
                data = replaceUrlsWithProxy(text, targetUrl, url.pathname);
            } else {
                data = await response.arrayBuffer();
            }

            return new Response(data, {
                status: response.status,
                headers: {
                    ...response.headers,
                    'Content-Type': contentType,
                },
            });
        } catch (error) {
            return new Response('Internal Server Error', { status: 500 });
        }
    } else {
        return new Response('Not Found', { status: 404 });
    }
}

function replaceUrlsWithProxy(content, baseUrl, clientRoute) {
    const urlPatterns = [
        /(href=")([^"]*)/g,
        /(src=")([^"]*)/g,
        /(url\()([^)]*)/g,
    ];

    for (const pattern of urlPatterns) {
        content = content.replace(pattern, (match, prefix, url) => {
            const fullUrl = new URL(url, baseUrl).toString();
            return `${prefix}${clientRoute}?url=${encodeURIComponent(fullUrl)}`;
        });
    }

    return content;
}