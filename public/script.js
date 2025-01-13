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
        const result = math.evaluate(expression);

        if (result === math.evaluate('0721+4545*1111/2222')) {
            document.getElementById('popup').style.display = 'flex';
        } else {
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

    try {
        const response = await fetch('https://keisan.glissando920.workers.dev/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
            const proxyUrl = `https://calc.glissando920.workers.dev/?url=https://www.google.com`;
            window.open(proxyUrl, '_blank');
            document.getElementById('popup').style.display = 'none';
        } else {
            alert(data.message || '認証失敗');
        }
    } catch (error) {
        console.error('認証エラー:', error);
        alert('認証中にエラーが発生しました');
    }
}