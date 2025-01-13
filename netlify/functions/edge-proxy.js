export default async (request, context) => {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
        return new Response('URL parameter is required', { status: 400 });
    }

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: request.headers,
            body: request.method === 'POST' ? await request.text() : undefined,
        });

        return new Response(response.body, {
            status: response.status,
            headers: response.headers,
        });
    } catch (error) {
        return new Response('Internal Server Error', { status: 500 });
    }
};