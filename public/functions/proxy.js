export async function onRequest(context) {
    // リクエストURLからプロキシ対象のURLを取得
    const url = new URL(context.request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
        return new Response('Target URL is required', { status: 400 });
    }

    try {
        // プロキシ対象のURLにリクエストを転送
        const response = await fetch(targetUrl, {
            headers: context.request.headers, // ヘッダーを転送
        });

        // レスポンスをクライアントに返す
        return new Response(response.body, {
            status: response.status,
            headers: response.headers,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response('Failed to proxy request', { status: 500 });
    }
}