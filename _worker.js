addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 静的ファイル配信
    if (path === '/' || path.startsWith('/styles.css') || path.startsWith('/script.js')) {
        const response = await fetch(`./${path}`);
        return response;
    }

    // 認証エンドポイント
    if (path === '/auth' && request.method === 'POST') {
        try {
            const { onRequestPost } = require('./functions/auth');
            return onRequestPost({ request });
        } catch (e) {
            console.error("Error handling /auth:", e);
            return new Response('Internal Server Error', { status: 500 });
        }
    }

    // プロキシエンドポイント
    if (path === '/proxy') {
        try {
            const { onRequestGet } = require('./functions/proxy');
            return onRequestGet({ request });
        } catch (e) {
            console.error("Error handling /proxy:", e);
            return new Response('Internal Server Error', { status: 500 });
        }
    }

    // 他のパスは404
    return new Response('Not Found', { status: 404 });
}