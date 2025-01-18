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
            navigateTo(link.href);
        });
    });

    // フォームの書き換え
    const forms = browserContent.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const action = form.action;
            const method = form.method;
            const formData = new FormData(form);
            const urlParams = new URLSearchParams(formData).toString();
            const fullUrl = `${action}?${urlParams}`;
            navigateTo(fullUrl);
        });
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