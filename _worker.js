addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORSヘッダーを設定
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', // すべてのオリジンを許可（本番環境では特定のオリジンを指定することを推奨）
        'Access-Control-Allow-Methods': 'POST, OPTIONS', // 許可するHTTPメソッド
        'Access-Control-Allow-Headers': 'Content-Type', // 許可するヘッダー
    };

    // OPTIONSプリフライトリクエストに対応
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: corsHeaders,
        });
    }

    // 認証エンドポイント
    if (path === '/auth' && request.method === 'POST') {
        try {
            const { username, password } = await request.json();

            // 認証ロジック
            if (username === 'glisand' && password === '0721454511112222') {
                // クライアントごとに一意のルートを生成
                const clientRoute = `/proxy/${generateRandomString(32)}`;
                return new Response(JSON.stringify({ success: true, route: clientRoute }), {
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

    // プロキシエンドポイント
    if (path.startsWith('/proxy/')) {
        const targetUrl = url.searchParams.get('url') || 'https://yandex.com'; // デフォルトでyandex.comに飛ばす

        try {
            const response = await fetch(targetUrl, {
                method: request.method,
                headers: request.headers,
                body: request.method === 'POST' ? await request.text() : undefined,
            });

            const contentType = response.headers.get('content-type') || '';
            let data;

            if (contentType.includes('text/html') || contentType.includes('text/css') || contentType.includes('application/javascript')) {
                // HTML、CSS、JavaScriptの場合、URLをプロキシ経由に変換
                const text = await response.text();
                data = replaceUrlsWithProxy(text, targetUrl, url.pathname);
            } else {
                // その他の場合（画像など）、バイナリデータをそのまま返す
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

// ランダムな文字列を生成する関数
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// HTMLやJavaScriptに埋め込まれたURLをプロキシ経由に変換する関数
function replaceUrlsWithProxy(content, baseUrl, clientRoute) {
    const urlPatterns = [
        /(href=")(\/[^"]*)/g, // href属性の相対URL
        /(src=")(\/[^"]*)/g,  // src属性の相対URL
        /(url\()([^)]*)/g,    // CSSのurl()内のURL
    ];

    for (const pattern of urlPatterns) {
        content = content.replace(pattern, (match, prefix, url) => {
            const fullUrl = new URL(url, baseUrl).toString();
            return `${prefix}${clientRoute}?url=${encodeURIComponent(fullUrl)}`;
        });
    }

    return content;
}