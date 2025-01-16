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

        return new Response(response.body, {
            status: response.status,
            headers: response.headers,
        });
    } catch (error) {
        return new Response('Internal Server Error', { status: 500 });
    }
}