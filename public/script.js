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
        rewriteLinksAndForms();
        rewriteResourceUrls();
        historyStack.push(url);
        currentIndex = historyStack.length - 1;
    } catch (e) {
        browserContent.innerHTML = `<p>エラー: ${e.message}</p>`;
    } finally {
        loading.style.display = 'none';
        browserContent.style.display = 'block';
    }
}

function rewriteLinksAndForms() {
    // リンクの書き換え
    const links = browserContent.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const absoluteUrl = new URL(href, addressBar.value).href;
            navigateTo(absoluteUrl);
        });
    });

    // フォームの書き換え
    const forms = browserContent.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const action = form.getAttribute('action');
            const method = form.getAttribute('method') || 'GET';
            const formData = new FormData(form);
            const urlParams = new URLSearchParams(formData).toString();
            const absoluteUrl = new URL(action, addressBar.value).href;
            const fullUrl = method === 'GET' ? `${absoluteUrl}?${urlParams}` : absoluteUrl;
            navigateTo(fullUrl);
        });
    });
}

function rewriteResourceUrls() {
    // 画像のURLをプロキシ経由に書き換え
    const images = browserContent.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
            img.src = `/proxy?url=${encodeURIComponent(new URL(src, addressBar.value).href)}`;
        }
    });

    // CSSやJSのURLをプロキシ経由に書き換え
    const links = browserContent.querySelectorAll('link[href], script[src]');
    links.forEach(link => {
        const href = link.getAttribute('href') || link.getAttribute('src');
        if (href && !href.startsWith('data:')) {
            const newHref = `/proxy?url=${encodeURIComponent(new URL(href, addressBar.value).href)}`;
            if (link.tagName === 'LINK') {
                link.href = newHref;
            } else if (link.tagName === 'SCRIPT') {
                const newScript = document.createElement('script');
                newScript.src = newHref;
                link.replaceWith(newScript);
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
    navigateTo(historyStack[currentIndex]);
}