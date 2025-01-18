let display = document.getElementById('display');
let browser = document.getElementById('browser');
let browserContent = document.getElementById('browser-content');
let addressBar = document.getElementById('address-bar');

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

function navigateTo(url) {
    addressBar.value = url;
    browserContent.src = `/proxy?url=${encodeURIComponent(url)}`;
}

function navigate() {
    let url = addressBar.value;
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }
    navigateTo(url);
}

function goBack() {
    browserContent.contentWindow.history.back();
}

function goForward() {
    browserContent.contentWindow.history.forward();
}

function reloadPage() {
    browserContent.contentWindow.location.reload();
}