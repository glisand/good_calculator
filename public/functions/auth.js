export async function onRequestPost(context) {
    const { request } = context;

    try {
        const { username, password } = await request.json();

        if (username === 'glisand' && password === '0721454511112222') {
            // ユーザー名とパスワードに基づいてハッシュを生成 (例: 単純な結合)
            const hash = username + password; //より安全なハッシュ関数を使用してください

            // ハッシュをルートに含むオブジェクトを返す
            return new Response(JSON.stringify({ success: true, route: hash }), {
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