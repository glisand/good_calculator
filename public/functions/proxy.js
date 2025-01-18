const SUPPORTED_RESOURCE_TYPES = ['image', 'script', 'style', 'font'];

async function fetchAndReplace(url, requestHeaders, baseUrl) {
    try {
        const response = await fetch(url, { headers: requestHeaders });
        const contentType = response.headers.get('content-type');

        if (!contentType) {
            return response;
        }

        let text = await response.text();

        if (contentType.includes('text/css')) {
            const cssUrlRegex = /url\(['"]?(?!data:)([^'")]*)['"]?\)/g;
            text = text.replace(cssUrlRegex, (match, resourcePath) => {
                const absoluteResourceUrl = new URL(resourcePath, baseUrl).href;
                return `url('/proxy-resource?url=${encodeURIComponent(baseUrl)}&resource_url=${encodeURIComponent(absoluteResourceUrl)}')`;
            });
        } else if (contentType.includes('text/html')) {
            const htmlUrlRegex = /(?:src|href)\s*=\s*["'](?!https?:\/\/|\/proxy-resource)([^"']+)["']/gi;
            text = text.replace(htmlUrlRegex, (match, resourcePath) => {
                const absoluteResourceUrl = new URL(resourcePath, baseUrl).href;
                return `${match.split('=')[0]}='/proxy-resource?url=${encodeURIComponent(baseUrl)}&resource_url=${encodeURIComponent(absoluteResourceUrl)}'`;
            });

            if (!/<base\s+href=/.test(text)) {
                const baseTag = `<base href="${baseUrl}">`;
                text = text.replace('<head>', `<head>${baseTag}`);
            }
        }

        const headers = new Headers(response.headers);
        headers.delete('X-Frame-Options');
        headers.delete('Content-Security-Policy');
        headers.delete('Content-Security-Policy-Report-Only');

        return new Response(text, {
            status: response.status,
            headers: headers
        });

    } catch (error) {
        console.error("Resource fetch error:", error);
        return new Response('Resource fetch error', { status: 500 });
    }
}

export async function onRequestGet(context) {
    const { request } = context;
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
        return new Response('URL parameter is required', { status: 400 });
    }

    try {
        const target = new URL(targetUrl);

        const response = await fetch(targetUrl, {
            headers: request.headers,
            redirect: 'manual',
        });

        if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
            const redirectUrl = response.headers.get('location');
            const resolvedRedirectUrl = new URL(redirectUrl, targetUrl).toString();
            return Response.redirect(`/proxy?url=${encodeURIComponent(resolvedRedirectUrl)}`, response.status);
        }

        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('text/html')) {
            return fetchAndReplace(targetUrl, request.headers, targetUrl);
        } else {
            const arrayBuffer = await response.arrayBuffer();
            const headers = new Headers(response.headers);
            headers.delete('X-Frame-Options');
            headers.delete('Content-Security-Policy');
            headers.delete('Content-Security-Policy-Report-Only');
            return new Response(arrayBuffer, {
                status: response.status,
                headers: headers
            });
        }

    } catch (error) {
        console.error("Proxy Error:", error);
        return new Response('プロキシエラーが発生しました', { status: 500 });
    }
}

export async function onRequestGetResource(context) {
    const { request } = context;
    const url = new URL(request.url);
    const baseUrl = url.searchParams.get('url');
    const resourceUrl = url.searchParams.get('resource_url');

    if (!baseUrl || !resourceUrl) {
        return new Response('Base URL and resource URL parameters are required', { status: 400 });
    }

    try {
        const response = await fetch(resourceUrl, {
            headers: request.headers
        });
        const headers = new Headers(response.headers);
        headers.delete('X-Frame-Options');
        headers.delete('Content-Security-Policy');
        headers.delete('Content-Security-Policy-Report-Only');
        return new Response(response.body, {
            status: response.status,
            headers: headers
        });
    } catch (error) {
        console.error("Error fetching resource:", error);
        return new Response('Error fetching resource', { status: 500 });
    }
}