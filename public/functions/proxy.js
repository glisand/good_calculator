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
        });

        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('text/html') || contentType.includes('text/css') || contentType.includes('application/javascript')) {
            // HTML、CSS、JavaScriptの場合、URLをプロキシ経由に変換
            const text = await response.text();
            data = replaceUrlsWithProxy(text, targetUrl, url.pathname);
        } else {
            // その他の場合（画像など）、バイナリデータをそのまま返す
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
