addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    if (url.pathname === '/proxy') {
        const targetUrl = url.searchParams.get('url');
        if (!targetUrl) {
            return new Response('URL parameter is missing', { status: 400 });
        }
        try {
            const requestBody = request.method === 'GET' || request.method === 'HEAD' ? null : request.body; // GET/HEAD リクエストは body なし
            const response = await fetch(targetUrl, {
                headers: request.headers,
                method: request.method,
                body: requestBody,
                redirect: 'manual' // リダイレクトを処理しない
            });

            // レスポンスヘッダーをコピー
            const headers = new Headers(response.headers);
            headers.set('Access-Control-Allow-Origin', '*');

            // リダイレクトの場合、Location ヘッダーを書き換えて返す
            if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
                const location = response.headers.get('location');
                const absoluteLocation = new URL(location, targetUrl).href;
                headers.set('location', `/proxy?url=${encodeURIComponent(absoluteLocation)}`);
                return new Response(null, {
                    status: response.status,
                    headers: headers
                });
            }

            const responseBody = await response.blob(); // Blob として取得

            return new Response(responseBody, {
                status: response.status,
                headers: headers
            });
        } catch (e) {
            return new Response('Proxy error', { status: 500 });
        }
    }
    return fetch(request);
}