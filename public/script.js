let currentInput = '';
let operator = null;
let previousInput = '';

function appendNumber(number) {
    currentInput += number;
    updateDisplay();
}

function appendOperator(op) {
    if (currentInput === '') return;
    if (previousInput !== '') {
        calculate();
    }
    operator = op;
    previousInput = currentInput;
    currentInput = '';
}

function appendDecimal() {
    if (!currentInput.includes('.')) {
        currentInput += '.';
        updateDisplay();
    }
}

function clearDisplay() {
    currentInput = '';
    previousInput = '';
    operator = null;
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('display').value = currentInput;
}

function calculate() {
    if (operator === null || currentInput === '') return;
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '×':
            result = prev * current;
            break;
        case '÷':
            result = prev / current;
            break;
        default:
            return;
    }
    currentInput = result.toString();
    operator = null;
    previousInput = '';
    updateDisplay();
    checkSpecialCalculation();
}

function sqrt() {
    currentInput = Math.sqrt(parseFloat(currentInput)).toString();
    updateDisplay();
}

function power() {
    currentInput = Math.pow(parseFloat(currentInput), 2).toString();
    updateDisplay();
}

function checkSpecialCalculation() {
    if (currentInput === '5268') {
        alert('特別な計算結果です！');
        document.getElementById('calculator').style.display = 'none';
        document.getElementById('browser').style.display = 'block';
        navigateToProxy('https://yandex.com');
    }
}

function navigateToProxy(url) {
    document.getElementById('browser-content').src = `/proxy?url=${encodeURIComponent(url)}`;
}

function goBack() {
    document.getElementById('browser-content').contentWindow.history.back();
}

function goForward() {
    document.getElementById('browser-content').contentWindow.history.forward();
}

function reloadPage() {
    document.getElementById('browser-content').contentWindow.location.reload();
}

function navigate() {
    const url = document.getElementById('address-bar').value;
    navigateToProxy(url);
}