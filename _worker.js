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
            const response = await fetch(targetUrl, {
                headers: request.headers,
                method: request.method,
                body: request.body
            });
            const modifiedResponse = new Response(response.body, response);
            modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
            return modifiedResponse;
        } catch (e) {
            return new Response('Proxy error', { status: 500 });
        }
    }
    return fetch(request);
}