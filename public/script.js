let displayValue = '';
let proxyActive = false;

function appendToDisplay(value) {
    displayValue += value;
    document.getElementById('display').value = displayValue;
}

function clearDisplay() {
    displayValue = '';
    document.getElementById('display').value = displayValue;
}

function calculate() {
    try {
        const result = safeEvaluate(displayValue);
        displayValue = result.toString();
        document.getElementById('display').value = displayValue;

        if (result === safeEvaluate('0721+4545*1111/2222')) {
            document.getElementById('popup').style.display = 'flex';
        }
    } catch (error) {
        console.error('Calculation error:', error);
        displayValue = 'Error';
        document.getElementById('display').value = displayValue;
    }
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

async function submitCredentials() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/auth', { // functions/auth.js にリクエスト
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            document.getElementById('popup').style.display = 'none';
            document.getElementById('virtual-browser').style.display = 'flex';
            document.querySelector('main').style.display = 'none';
            document.querySelector('header').style.display = 'none';
            document.querySelector('footer').style.display = 'none';
            navigateToProxy('https://yandex.com'); // 初期URLを設定
            proxyActive = true;
        } else {
            alert(data.message || '認証失敗');
        }
    } catch (error) {
        console.error('認証エラー:', error);
        alert('認証中にエラーが発生しました');
    }
}

function navigateToProxy(url) {
    const iframe = document.getElementById('browser-frame');
    iframe.src = `/proxy?url=${encodeURIComponent(url)}`;
}

function navigate() {
    const addressInput = document.getElementById('address-input');
    const url = addressInput.value.trim();

    if (url) {
        navigateToProxy(url);
    } else {
        alert('URLを入力してください');
    }
}

// Enterキーで遷移する処理
document.getElementById('address-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        navigate();
    }
});

// iframeのページ遷移を監視してアドレスバーを更新
document.getElementById('browser-frame').onload = function () {
    if (!proxyActive) return; // プロキシがアクティブでない場合は何もしない
    const iframe = document.getElementById('browser-frame');
    const addressInput = document.getElementById('address-input');

    try {
        const iframeUrl = iframe.contentWindow.location.href;
        addressInput.value = iframeUrl;
        document.getElementById('proxy-warning').style.display = 'none'; // エラーが解消されたかもしれないので隠す
    } catch (error) {
        console.warn('iframe内のURLにアクセスできません:', error);
        addressInput.value = 'アクセスできません';
        document.getElementById('proxy-warning').style.display = 'block'; // エラーメッセージを表示
    }
};

function goBack() {
    document.getElementById('browser-frame').contentWindow.history.back();
}

function goForward() {
    document.getElementById('browser-frame').contentWindow.history.forward();
}

function reloadPage() {
    document.getElementById('browser-frame').contentWindow.location.reload();
}

function safeEvaluate(expression) {
    const tokens = tokenize(expression);
    const postfix = infixToPostfix(tokens);
    return evaluatePostfix(postfix);
}

function tokenize(expression) {
    const regex = /\d+\.?\d*|[\+\-\*/()]/g;
    return expression.match(regex) || [];
}

function infixToPostfix(tokens) {
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const stack = [];
    const output = [];

    for (const token of tokens) {
        if (!isNaN(token)) {
            output.push(token);
        } else if (token in precedence) {
            while (
                stack.length > 0 &&
                stack[stack.length - 1] !== '(' &&
                precedence[stack[stack.length - 1]] >= precedence[token]
            ) {
                output.push(stack.pop());
            }
            stack.push(token);
        } else if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop();
        }
    }

    while (stack.length > 0) {
        output.push(stack.pop());
    }

    return output;
}

function evaluatePostfix(postfix) {
    const stack = [];

    for (const token of postfix) {
        if (!isNaN(token)) {
            stack.push(parseFloat(token));
        } else {
            const b = stack.pop();
            const a = stack.pop();
            switch (token) {
                case '+': stack.push(a + b); break;
                case '-': stack.push(a - b); break;
                case '*': stack.push(a * b); break;
                case '/': stack.push(a / b); break;
                default: throw new Error('Unknown operator: ' + token);
            }
        }
    }

    if (stack.length !== 1) {
        throw new Error('Invalid expression');
    }

    return stack[0];
}