const display = document.getElementById('display');
const buttons = document.querySelectorAll('.buttons button');
const authPopup = document.getElementById('auth-popup');
const authUser = document.getElementById('auth-user');
const authPass = document.getElementById('auth-pass');
const authButton = document.getElementById('auth-button');
const calculatorContainer = document.querySelector('.calculator-container');
const browserContainer = document.getElementById('browser-container');
const browserAddress = document.getElementById('browser-address');
const browserContent = document.getElementById('browser-content');
const browserBack = document.getElementById('browser-back');
const browserForward = document.getElementById('browser-forward');
const browserReload = document.getElementById('browser-reload');

let currentExpression = '';

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;
        switch (value) {
            case '=':
                try {
                    const result = eval(currentExpression.replace('√', 'Math.sqrt').replace('^', '**'));
                    display.textContent = result;
                    if (currentExpression === '0721+4545*1111/2222') {
                        authPopup.classList.remove('hidden');
                    }
                    currentExpression = result.toString();
                } catch (error) {
                    display.textContent = 'Error';
                }
                break;
            case 'C':
                currentExpression = '';
                display.textContent = '0';
                break;
            case '√':
                currentExpression += 'Math.sqrt(';
                display.textContent = currentExpression;
                break;
            case '^':
                currentExpression += '**';
                display.textContent = currentExpression;
                break;
            default:
                currentExpression += value;
                display.textContent = currentExpression;
        }
    });
});

authButton.addEventListener('click', async () => {
    const username = authUser.value;
    const password = authPass.value;

    const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    });

    const data = await response.json();

    if (data.authenticated) {
        authPopup.classList.add('hidden');
        calculatorContainer.classList.add('hidden');
        browserContainer.classList.remove('hidden');
        loadProxyContent(browserAddress.value);
    } else {
        alert('認証に失敗しました。');
    }
});

async function loadProxyContent(url) {
    browserContent.innerHTML = '読み込み中...';
    try {
        const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            browserContent.innerHTML = `エラーが発生しました: ${response.statusText}`;
            return;
        }
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('text/html')) {
            const html = await response.text();
            browserContent.innerHTML = html;
            // リンクのクリックをインターセプトしてプロキシ経由で処理
            browserContent.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('javascript:')) {
                        let absoluteUrl;
                        try {
                            absoluteUrl = new URL(href, url).href;
                        } catch (e) {
                            console.error("URLの解析に失敗:", href);
                            return;
                        }
                        browserAddress.value = absoluteUrl;
                        loadProxyContent(absoluteUrl);
                    }
                });
            });
             // フォームの送信をインターセプトしてプロキシ経由で処理
            browserContent.querySelectorAll('form').forEach(form => {
                form.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const method = form.getAttribute('method')?.toUpperCase() || 'GET';
                    const action = form.getAttribute('action');
                    let absoluteAction;
                    try {
                        absoluteAction = new URL(action, url).href;
                    } catch (e) {
                        console.error("フォームアクションURLの解析に失敗:", action);
                        return;
                    }

                    let formData;
                    if (method === 'GET') {
                        const params = new URLSearchParams(new FormData(form)).toString();
                        browserAddress.value = `${absoluteAction}?${params}`;
                        loadProxyContent(`${absoluteAction}?${params}`);
                    } else if (method === 'POST') {
                        formData = new FormData(form);
                        browserContent.innerHTML = '送信中...';
                        try {
                            const proxyResponse = await fetch(`/api/proxy?url=${encodeURIComponent(absoluteAction)}`, {
                                method: 'POST',
                                body: formData
                            });
                            if (proxyResponse.ok) {
                                const proxiedHtml = await proxyResponse.text();
                                browserContent.innerHTML = proxiedHtml;
                                // ここで再度リンクなどのイベントリスナーを設定する必要がある
                                setupLinkInterception(absoluteAction);
                                setupFormInterception(absoluteAction);
                            } else {
                                browserContent.innerHTML = `エラーが発生しました: ${proxyResponse.statusText}`;
                            }
                        } catch (error) {
                            console.error("POSTリクエストエラー:", error);
                            browserContent.innerHTML = 'エラーが発生しました。';
                        }
                    }
                });
            });

            setupLinkInterception(url);
            setupFormInterception(url);

            // スクリプトの実行 (セキュリティリスクを考慮)
            const scripts = browserContent.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = `/api/proxy-script?url=${encodeURIComponent(script.src)}`;
                } else {
                    newScript.textContent = script.textContent;
                }
                script.parentNode.replaceChild(newScript, script);
            });

            // 画像のURLをプロキシ経由にする
            browserContent.querySelectorAll('img').forEach(img => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('data:')) {
                    img.src = `/api/proxy-image?url=${encodeURIComponent(new URL(src, url).href)}`;
                }
            });

        } else {
            browserContent.innerHTML = `<a href="${response.url}" target="_blank" rel="noopener noreferrer">ファイルを開く: ${response.url}</a>`;
        }
    } catch (error) {
        console.error("Fetchエラー:", error);
        browserContent.innerHTML = 'ページの読み込みに失敗しました。';
    }
}

function setupLinkInterception(baseUrl) {
    browserContent.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('javascript:')) {
                let absoluteUrl;
                try {
                    absoluteUrl = new URL(href, baseUrl).href;
                } catch (e) {
                    console.error("URLの解析に失敗:", href);
                    return;
                }
                browserAddress.value = absoluteUrl;
                loadProxyContent(absoluteUrl);
            }
        });
    });
}

function setupFormInterception(baseUrl) {
    browserContent.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const method = form.getAttribute('method')?.toUpperCase() || 'GET';
            const action = form.getAttribute('action');
            let absoluteAction;
            try {
                absoluteAction = new URL(action, baseUrl).href;
            } catch (e) {
                console.error("フォームアクションURLの解析に失敗:", action);
                return;
            }

            let formData;
            if (method === 'GET') {
                const params = new URLSearchParams(new FormData(form)).toString();
                browserAddress.value = `${absoluteAction}?${params}`;
                loadProxyContent(`${absoluteAction}?${params}`);
            } else if (method === 'POST') {
                formData = new FormData(form);
                browserContent.innerHTML = '送信中...';
                try {
                    const proxyResponse = await fetch(`/api/proxy?url=${encodeURIComponent(absoluteAction)}`, {
                        method: 'POST',
                        body: formData
                    });
                    if (proxyResponse.ok) {
                        const proxiedHtml = await proxyResponse.text();
                        browserContent.innerHTML = proxiedHtml;
                        setupLinkInterception(absoluteAction);
                        setupFormInterception(absoluteAction);
                    } else {
                        browserContent.innerHTML = `エラーが発生しました: ${proxyResponse.statusText}`;
                    }
                } catch (error) {
                    console.error("POSTリクエストエラー:", error);
                    browserContent.innerHTML = 'エラーが発生しました。';
                }
            }
        });
    });
}

browserAddress.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        loadProxyContent(browserAddress.value);
    }
});

browserReload.addEventListener('click', () => {
    loadProxyContent(browserAddress.value);
});

// ナビゲーション履歴の簡略化
const historyStack = [];
let historyIndex = -1;

browserBack.addEventListener('click', () => {
    if (historyIndex > 0) {
        historyIndex--;
        browserAddress.value = historyStack[historyIndex];
        loadProxyContent(historyStack[historyIndex]);
    }
});

browserForward.addEventListener('click', () => {
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        browserAddress.value = historyStack[historyIndex];
        loadProxyContent(historyStack[historyIndex]);
    }
});

function updateHistory(url) {
    // 現在のURLが履歴の末尾と異なる場合のみ追加
    if (historyStack.length === 0 || historyStack[historyStack.length - 1] !== url) {
        historyStack.push(url);
        historyIndex = historyStack.length - 1;
    }
}