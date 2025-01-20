let display = document.getElementById('display');
let browser = document.getElementById('browser');
let browserContent = document.getElementById('browser-content');
let addressBar = document.getElementById('address-bar');
let loading = document.getElementById('loading');
let historyStack = [];
let currentIndex = -1;

function appendToDisplay(value) {
    display.innerText += value;
}

function clearDisplay() {
    display.innerText = '';
}

function calculate() {
    let expression = display.innerText;
    expression = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/√/g, 'Math.sqrt').replace(/\^/g, '**');
    try {
        let result = eval(expression);
        display.innerText = result;
        if (expression === '0721+4545*1111/2222') {
            showBrowser();
        }
    } catch (e) {
        display.innerText = 'エラー';
    }
}

function showBrowser() {
    let hokuryou = prompt('hokuryouと入力してください');
    let calc = prompt('calcと入力してください');
    if (hokuryou === 'hokuryou' && calc === 'calc') {
        document.getElementById('calculator').style.display = 'none';
        browser.style.display = 'flex';
        navigateTo('https://yandex.com');
    } else {
        alert('認証に失敗しました');
    }
}

async function navigateTo(url) {
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }
    addressBar.value = url;
    loading.style.display = 'flex';
    browserContent.style.display = 'none';
    try {
        const response = await fetch(`/proxy?url=${encodeURIComponent(url)}`);
        const html = await response.text();
        browserContent.innerHTML = html;
        rewriteLinksAndForms(url); // ベースURLを渡す
        rewriteResourceUrls(url); // ベースURLを渡す
        historyStack.push(url);
        currentIndex = historyStack.length - 1;
    } catch (e) {
        browserContent.innerHTML = `<p>エラー: ${e.message}</p>`;
    } finally {
        loading.style.display = 'none';
        browserContent.style.display = 'block';
    }
}

function rewriteLinksAndForms(baseUrl) {
    // リンクの書き換え
    const links = browserContent.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) {
                let absoluteUrl;
                try {
                    absoluteUrl = new URL(href, baseUrl).href;
                } catch (error) {
                    console.error("URLの解析に失敗:", href, error);
                    return;
                }
                navigateTo(absoluteUrl);
            }
        });
    });

    // フォームの書き換え
    const forms = browserContent.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => { // async 関数に変更
            e.preventDefault();
            const action = form.getAttribute('action');
            const method = form.getAttribute('method') || 'GET';
            const formData = new FormData(form);
            let absoluteActionUrl;
            try {
                absoluteActionUrl = new URL(action, baseUrl).href;
            } catch (error) {
                console.error("URLの解析に失敗:", action, error);
                return;
            }

            loading.style.display = 'flex';
            browserContent.style.display = 'none';

            try {
                const response = await fetch(`/proxy?url=${encodeURIComponent(absoluteActionUrl)}`, {
                    method: method.toUpperCase(), // メソッドを大文字に
                    headers: {
                        'Content-Type': form.enctype === 'multipart/form-data' ? null : 'application/x-www-form-urlencoded', // multipart/form-data の場合は Content-Type をブラウザに任せる
                    },
                    body: method.toUpperCase() === 'GET' ? null : new URLSearchParams(formData).toString(), // GET の場合は body を null に
                });
                const html = await response.text();
                browserContent.innerHTML = html;
                rewriteLinksAndForms(absoluteActionUrl); // ベースURLを渡す
                rewriteResourceUrls(absoluteActionUrl); // ベースURLを渡す
                historyStack.push(absoluteActionUrl);
                currentIndex = historyStack.length - 1;
            } catch (error) {
                browserContent.innerHTML = `<p>エラー: ${error.message}</p>`;
            } finally {
                loading.style.display = 'none';
                browserContent.style.display = 'block';
            }
        });
    });
}

function rewriteResourceUrls(baseUrl) {
    // 画像のURLをプロキシ経由に書き換え
    const images = browserContent.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
            try {
                img.src = `/proxy?url=${encodeURIComponent(new URL(src, baseUrl).href)}`;
            } catch (error) {
                console.error("URLの解析に失敗:", src, error);
            }
        }
    });

    // CSSやJSのURLをプロキシ経由に書き換え
    const links = browserContent.querySelectorAll('link[href], script[src]');
    links.forEach(link => {
        const href = link.getAttribute('href') || link.getAttribute('src');
        if (href && !href.startsWith('data:')) {
            try {
                const absoluteHref = new URL(href, baseUrl).href;
                const newHref = `/proxy?url=${encodeURIComponent(absoluteHref)}`;
                if (link.tagName === 'LINK') {
                    link.href = newHref;
                } else if (link.tagName === 'SCRIPT') {
                    const newScript = document.createElement('script');
                    newScript.src = newHref;
                    link.replaceWith(newScript);
                }
            } catch (error) {
                console.error("URLの解析に失敗:", href, error);
            }
        }
    });
}

function navigate() {
    const url = addressBar.value;
    navigateTo(url);
}

function handleAddressBarKeyPress(event) {
    if (event.key === 'Enter') {
        navigate();
    }
}

function goBack() {
    if (currentIndex > 0) {
        currentIndex--;
        navigateTo(historyStack[currentIndex]);
    }
}

function goForward() {
    if (currentIndex < historyStack.length - 1) {
        currentIndex++;
        navigateTo(historyStack[currentIndex]);
    }
}

function reloadPage() {
    if (historyStack.length > 0 && currentIndex >= 0) {
        navigateTo(historyStack[currentIndex]);
    }
}