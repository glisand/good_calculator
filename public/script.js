let displayValue = '';

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
        const response = await fetch('/auth', {
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
            document.getElementById('virtual-browser').style.display = 'block';
            navigateToProxy();
        } else {
            alert(data.message || '認証失敗');
        }
    } catch (error) {
        console.error('認証エラー:', error);
        alert('認証中にエラーが発生しました');
    }
}

function navigateToProxy() {
    const iframe = document.getElementById('browser-frame');
    iframe.src = '/proxy?url=https://yandex.com'; // デフォルトでyandex.comにアクセス
}

function navigate() {
    const addressInput = document.getElementById('address-input');
    const url = addressInput.value.trim();

    if (url) {
        const iframe = document.getElementById('browser-frame');
        iframe.src = `/proxy?url=${encodeURIComponent(url)}`;
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
    const iframe = document.getElementById('browser-frame');
    const addressInput = document.getElementById('address-input');

    try {
        // iframe内のURLを取得してアドレスバーに反映
        const iframeUrl = iframe.contentWindow.location.href;
        addressInput.value = iframeUrl;
    } catch (error) {
        // CORS制約によりiframe内のURLにアクセスできない場合のエラーハンドリング
        console.warn('iframe内のURLにアクセスできません:', error);
    }
};

// 安全な計算処理
function safeEvaluate(expression) {
    const tokens = tokenize(expression);
    const postfix = infixToPostfix(tokens);
    return evaluatePostfix(postfix);
}

// トークン化
function tokenize(expression) {
    const regex = /\d+\.?\d*|[\+\-\*/()]/g;
    return expression.match(regex) || [];
}

// 中置記法から後置記法に変換
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

// 後置記法を評価
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