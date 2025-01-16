export async function onRequestPost(context) {
    const { request } = context;

    try {
        const { username, password } = await request.json();

        if (username === 'glisand' && password === '0721454511112222') {
            return new Response(JSON.stringify({ success: true, route: 'proxy' }), {
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
