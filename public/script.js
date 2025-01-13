import * as math from 'mathjs';

function appendToDisplay(value) {
    document.getElementById('display').value += value;
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

function calculate() {
    const expression = document.getElementById('display').value;

    try {
        if (expression === '0721+4545*1111/2222') {
            document.getElementById('popup').style.display = 'flex';
        } else {
            const result = math.evaluate(expression);
            document.getElementById('display').value = result;
        }
    } catch (error) {
        console.error('Calculation error:', error);
        document.getElementById('display').value = 'Error';
    }
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

async function submitCredentials() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'glisand' && password === '0721454511112222') {
        const proxyUrl = `https://calc.glissando920.workers.dev/?url=https://www.google.com`;
        window.open(proxyUrl, '_blank');
        document.getElementById('popup').style.display = 'none';
    } else {
        alert('認証失敗');
    }
}