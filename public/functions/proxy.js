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
            // CSS内のURLを置換
            const cssUrlRegex = /url\(['"]?(?!data:)([^'")]*)['"]?\)/g;
            text = text.replace(cssUrlRegex, (match, resourcePath) => {
                const absoluteResourceUrl = new URL(resourcePath, baseUrl).href;
                return `url('/proxy-resource?url=${encodeURIComponent(baseUrl)}&resource_url=${encodeURIComponent(absoluteResourceUrl)}')`;
            });
        } else if (contentType.includes('text/html')) {
            // HTML内のURLを置換
            const htmlUrlRegex = /(?:src|href)\s*=\s*["'](?!https?:\/\/|\/proxy-resource)([^"']+)["']/gi;
            text = text.replace(htmlUrlRegex, (match, resourcePath) => {
                const absoluteResourceUrl = new URL(resourcePath, baseUrl).href;
                return `${match.split('=')[0]}='/proxy-resource?url=${encodeURIComponent(baseUrl)}&resource_url=${encodeURIComponent(absoluteResourceUrl)}'`;
            });

            // <a> タグのクリックイベントをフック
            const linkRegex = /<a(?=[^>]*\s?href=["'](?!#)([^"']+))[^>]*>/gi;
            text = text.replace(linkRegex, (match, href) => {
                const absoluteHref = new URL(href, baseUrl).href;
                return match.replace(/href=["'][^"']*["']/, `href="${absoluteHref}" onclick="event.preventDefault(); window.parent.navigateToProxy('${absoluteHref}');"`);
            });

             // <base> タグが既に存在する場合は追加しない
            if (!/<base\s+href=/.test(text)) {
                const baseTag = `<base href="${baseUrl}">`;
                text = text.replace('<head>', `<head>${baseTag}`);
            }

            // 問題のあるスクリプトを削除または遅延実行 (yandexのMBEM関連エラー対策)
            text = text.replace(/<script[^>]*>\s*!function\(e,t\)\{.*MBEM.*<\/script>/s, '');
            text = text.replace(/<script[^>]*src=["'][^"']*yastatic\.net\/s3\/frontend\/yandex-int\/mini-suggest\/[^"']*["']><\/script>/, '');

        }

        const headers = new Headers(response.headers);
        headers.delete('X-Frame-Options');
        headers.delete('Content-Security-Policy');
        headers.delete('Content-Security-Policy-Report-Only'); // 念のためこちらも削除

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
            headers.delete('Content-Security-Policy-Report-Only'); // 念のためこちらも削除
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
        // MIMEタイプ不一致エラーの修正
        const resourcePath = new URL(resourceUrl).pathname;
        if (resourcePath.endsWith('.js')) {
            headers.set('Content-Type', 'application/javascript');
        } else if (resourcePath.endsWith('.css')) {
            headers.set('Content-Type', 'text/css');
        }

        return new Response(response.body, {
            status: response.status,
            headers: headers
        });
    } catch (error) {
        console.error("Error fetching resource:", error);
        return new Response('Error fetching resource', { status: 500 });
    }
}