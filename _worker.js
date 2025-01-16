addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', // すべてのオリジンを許可（本番環境では特定のオリジンを指定することを推奨）
        'Access-Control-Allow-Methods': 'POST, OPTIONS', // 許可するHTTPメソッド
        'Access-Control-Allow-Headers': 'Content-Type', // 許可するヘッダー
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
                return new Response(JSON.stringify({ success: true }), {
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
                    status: 401, // Unauthorized
                });
            }
        } catch (error) {
            return new Response(JSON.stringify({ success: false, message: '無効なリクエスト' }), {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
                status: 400, // Bad Request
            });
        }
    }

    if (path === '/proxy' && request.method === 'GET') {
        const targetUrl = url.searchParams.get('url');

        if (!targetUrl) {
            return new Response('URL parameter is required', { status: 400 });
        }

        try {
            const response = await fetch(targetUrl, {
                method: 'GET',
                headers: request.headers,
            });

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