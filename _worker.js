// functions/_worker.js
async function handleRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
  
    if (pathname === '/api/auth') {
      if (request.method === 'POST') {
        const contentType = request.headers.get('content-type');
        if (contentType !== 'application/json') {
          return new Response('Expected application/json', { status: 400 });
        }
  
        const { username, password } = await request.json();
        // 認証ロジック (例: 固定の認証情報)
        const isAuthenticated = username === 'hokuryou' && password === 'calc';
  
        return new Response(JSON.stringify({ authenticated: isAuthenticated }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return new Response('Method not allowed', { status: 405 });
      }
    } else if (pathname === '/api/proxy') {
      const targetUrlParam = url.searchParams.get('url');
      if (!targetUrlParam) {
        return new Response('Missing target URL', { status: 400 });
      }
  
      try {
        const targetUrl = new URL(targetUrlParam);
        const targetResponse = await fetch(targetUrl, {
          headers: request.headers,
          redirect: 'manual' // リダイレクトを手動で処理
        });
  
        // レスポンスヘッダーをコピー
        const headers = new Headers(targetResponse.headers);
  
        // CORSヘッダーを調整 (必要に応じて)
        headers.set('Access-Control-Allow-Origin', '*');
  
        // リダイレクト処理
        if (targetResponse.status >= 300 && targetResponse.status < 400) {
          const redirectUrl = targetResponse.headers.get('Location');
          if (redirectUrl) {
            const absoluteRedirectURL = new URL(redirectUrl, targetUrl).href;
            headers.set('Location', `/api/proxy?url=${encodeURIComponent(absoluteRedirectURL)}`);
            return new Response(targetResponse.body, {
              status: targetResponse.status,
              headers: headers,
            });
          }
        }
  
        let body = await targetResponse.blob();
        const contentType = targetResponse.headers.get('Content-Type');
  
        if (contentType && contentType.startsWith('text/html')) {
          const text = await targetResponse.text();
          // HTML内のリンクをプロキシURLに書き換える基本的な処理
          const proxiedHTML = text.replace(/(href|src)="([^"]*)"/g, (match, p1, p2) => {
            if (p2 && !p2.startsWith('data:') && !p2.startsWith('#')) {
              try {
                const absoluteUrl = new URL(p2, targetUrl).href;
                return `${p1}="/api/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
              } catch (e) {
                return match;
              }
            }
            return match;
          });
          body = new Blob([proxiedHTML], { type: 'text/html' });
        }
  
        return new Response(body, {
          status: targetResponse.status,
          headers: headers,
        });
      } catch (error) {
        console.error('プロキシエラー:', error);
        return new Response('プロキシエラーが発生しました', { status: 500 });
      }
    } else if (pathname === '/api/proxy-image') {
        const targetUrlParam = url.searchParams.get('url');
        if (!targetUrlParam) {
            return new Response('Missing target URL for image', { status: 400 });
        }
  
        try {
            const targetUrl = new URL(targetUrlParam);
            const targetResponse = await fetch(targetUrl, {
                headers: request.headers,
            });
  
            const headers = new Headers(targetResponse.headers);
            headers.set('Access-Control-Allow-Origin', '*');
  
            return new Response(targetResponse.body, {
                status: targetResponse.status,
                headers: headers,
            });
        } catch (error) {
            console.error('プロキシ画像エラー:', error);
            return new Response('プロキシ画像エラーが発生しました', { status: 500 });
        }
    } else if (pathname === '/api/proxy-script') {
      const targetUrlParam = url.searchParams.get('url');
      if (!targetUrlParam) {
          return new Response('Missing target URL for script', { status: 400 });
      }
  
      try {
          const targetUrl = new URL(targetUrlParam);
          const targetResponse = await fetch(targetUrl, {
              headers: request.headers,
          });
  
          const headers = new Headers(targetResponse.headers);
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Content-Type', 'application/javascript'); // 明示的にJavaScriptとして返す
  
          return new Response(targetResponse.body, {
              status: targetResponse.status,
              headers: headers,
          });
      } catch (error) {
          console.error('プロキシスクリプトエラー:', error);
          return new Response('プロキシスクリプトエラーが発生しました', { status: 500 });
      }
  }
  
    return await env.ASSETS.fetch(request);
  }
  
  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });