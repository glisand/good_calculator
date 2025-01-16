addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: corsHeaders,
        });
    }

    if (path === '/auth' && request.method === 'POST') {
        try {
            const { username, password } = await request.json();

            if (username === 'glisand' && password === '0721454511112222') {
                const authToken = btoa(`${username}:${password}`);
                return new Response(JSON.stringify({ success: true, key: authToken }), {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                });
            } else {
                return new Response(JSON.stringify({ success: false, message: '認証失敗' }), {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                    status: 401,
                });
            }
        } catch (error) {
            return new Response(JSON.stringify({ success: false, message: '無効なリクエスト' }), {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
                status: 400,
            });
        }
    }

    if (path === '/proxy' && request.method === 'GET') {
        const targetUrl = url.searchParams.get('url');
        const authKey = decodeURIComponent(url.searchParams.get('key'));

        if (!targetUrl || !authKey) {
            return new Response('URL and Key parameters are required', { status: 400 });
        }

        const decodedAuth = atob(authKey);
        if (decodedAuth !== 'glisand:0721454511112222') {
            return new Response('Unauthorized', { status: 401 });
        }

        try {
            const response = await fetch(targetUrl, {
                method: request.method,
                headers: request.headers,
            });

            if (response.headers.get('content-type').includes('text/html')) {
                let text = await response.text();
                text = text.replace(/href="\/search/g, `href="/proxy?key=${encodeURIComponent(authKey)}&url=https://yandex.com/search`);
                return new Response(text, {
                    status: response.status,
                    headers: { 'Content-Type': 'text/html' },
                });
            }

            return new Response(response.body, {
                status: response.status,
                headers: response.headers,
            });
        } catch (error) {
            return new Response('Internal Server Error', { status: 500 });
        }
    }

    return new Response('Not Found', { status: 404 });
}