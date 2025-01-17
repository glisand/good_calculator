addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 認証エンドポイント
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
    }

    // プロキシエンドポイント
    if (path === '/proxy') {
        const targetUrl = url.searchParams.get('url') || 'https://yandex.com'; // デフォルトでyandex.comにアクセス

        try {
            const response = await fetch(targetUrl, {
                method: request.method,
                headers: request.headers,
                body: request.method === 'POST' ? await request.text() : undefined,
            });

            const contentType = response.headers.get('content-type') || '';
            let data;

            if (contentType.includes('text/html')) {
                const text = await response.text();
                // <base>タグを追加して相対URLを正しく解決
                const baseTag = `<base href="${targetUrl}">`;
                const rewrittenHTML = text.replace(/<head>/, `<head>${baseTag}`);
                data = rewrittenHTML;
            } else {
                data = await response.buffer();
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
    }

    // その他のリクエストは404を返す
    return new Response('Not Found', { status: 404 });
}