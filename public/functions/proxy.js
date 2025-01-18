export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
        return new Response('URL parameter is missing', { status: 400 });
    }
    const proxyRequest = new Request(targetUrl, {
        headers: request.headers,
        method: request.method,
        body: request.body
    });
    try {
        const response = await fetch(proxyRequest);
        const modifiedResponse = new Response(response.body, response);
        modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
        return modifiedResponse;
    } catch (e) {
        return new Response('Proxy error', { status: 500 });
    }
}