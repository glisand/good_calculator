let displayValue = '';
let proxyActive = false;
let currentUrl = 'https://yandex.com';

function appendToDisplay(value) {
    const display = document.getElementById('display');
    display.value += value;
}

function clearDisplay() {
    const display = document.getElementById('display');
    display.value = '';
}

function calculate() {
    const display = document.getElementById('display');
    const expression = display.value;

    if (expression === '0731+4545*1111/2222') {
        openPopup();
    } else {
        try {
            display.value = eval(expression);
        } catch (error) {
            display.value = 'Error';
        }
    }
}

function openPopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'flex';
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}

async function submitCredentials() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (result.success) {
        closePopup();
        openVirtualBrowser();
    } else {
        alert('認証失敗');
    }
}

function openVirtualBrowser() {
    const virtualBrowser = document.getElementById('virtual-browser');
    virtualBrowser.style.display = 'flex';
    navigateTo(currentUrl);
}

function navigateTo(url) {
    const iframe = document.getElementById('browser-frame');
    iframe.src = `/proxy?url=${encodeURIComponent(url)}`;
    document.getElementById('address-input').value = url;
}

function navigate() {
    const addressInput = document.getElementById('address-input');
    const url = addressInput.value;
    if (url) {
        currentUrl = url;
        navigateTo(url);
    }
}

function goBack() {
    const iframe = document.getElementById('browser-frame');
    iframe.contentWindow.history.back();
}

function goForward() {
    const iframe = document.getElementById('browser-frame');
    iframe.contentWindow.history.forward();
}

function reloadPage() {
    const iframe = document.getElementById('browser-frame');
    iframe.contentWindow.location.reload();
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