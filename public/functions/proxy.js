// functions/proxy.js
export async function onRequestGet(context) {
    const { request } = context;
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
        return new Response('URL parameter is required', { status: 400 });
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: request.headers,
            redirect: 'manual', // リダイレクトを手動で処理
        });

        // リダイレクトの処理
        if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
            const redirectUrl = response.headers.get('location');
            const resolvedRedirectUrl = new URL(redirectUrl, targetUrl).toString();
            return Response.redirect(`/proxy?url=${encodeURIComponent(resolvedRedirectUrl)}`, 302);
        }

        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('text/html')) {
            const text = await response.text();
            // <base> タグを挿入して相対パスを解決
            const baseTag = `<base href="${targetUrl}">`;
            data = text.replace('<head>', `<head>${baseTag}`);
        } else {
            data = await response.arrayBuffer();
        }

        return new Response(data, {
            status: response.status,
            headers: {
                ...response.headers,
                'Content-Type': contentType,
                // CSP を削除して iframe 内での表示を許可するリスクを認識した上で設定
                'Content-Security-Policy': '',
            },
        });
    } catch (error) {
        console.error("Proxy Error:", error);
        return new Response('プロキシエラーが発生しました', { status: 500 });
    }
}