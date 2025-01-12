const PROXY_URL = "https://proxify.netlify.app/proxy";

exports.handler = async (event) => {
    if (event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body);

            // パスワード検証
            if (body.action === 'validateCredentials') {
                const { username, password } = body;
                if (username === 'glisand' && password === '0721454511112222') {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ success: true })
                    };
                } else {
                    return {
                        statusCode: 401,
                        body: JSON.stringify({ success: false, message: 'Invalid credentials' })
                    };
                }
            }

            // プロキシ機能
            if (body.action === 'proxyRequest' && body.url) {
                const htmlContent = await getURL(body.url);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ success: true, data: htmlContent })
                };
            }
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: error.message })
            };
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Invalid request' })
    };
};

async function getURL(pageURL) {
    const data = {
        pageURL
    };

    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    const res = await fetch(PROXY_URL, config);
    const htmlContent = await res.text();
    return htmlContent;
}