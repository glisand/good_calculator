export async function onRequestPost(context) {
    const { request } = context;

    try {
        const { username, password } = await request.json();

        if (username === 'glisand' && password === '0721454511112222') {
            // ユニークなルートを生成
            const route = generateUniqueRoute(username);
            return new Response(JSON.stringify({ 
                success: true,
                route: `proxy/${route}` // プロキシルートを返す
            }), {
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

function generateUniqueRoute(username) {
    // 簡単なハッシュ生成（実際の実装ではもっと安全な方法を使用してください）
    return Buffer.from(username + Date.now()).toString('base64').replace(/[/+=]/g, '');
}