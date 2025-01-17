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
            redirect: 'manual',
        });

        if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
            const redirectUrl = response.headers.get('location');
            const resolvedRedirectUrl = new URL(redirectUrl, targetUrl).toString();
            return Response.redirect(`/proxy?url=${encodeURIComponent(resolvedRedirectUrl)}`, 302);
        }

        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('text/html')) {
            const text = await response.text();
            const baseTag = `<base href="${targetUrl}">`;
            data = text.replace('<head>', `<head>${baseTag}`);
        } else {
            data = await response.arrayBuffer();
        }

        const headers = new Headers(response.headers);
        headers.delete('X-Frame-Options');
        headers.delete('Content-Security-Policy');

        return new Response(data, {
            status: response.status,
            headers: headers,
        });
    } catch (error) {
        console.error("Proxy Error:", error);
        return new Response('プロキシエラーが発生しました', { status: 500 });
    }
}