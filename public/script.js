function appendToDisplay(value) {
    document.getElementById('display').value += value;
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

async function calculate() {
    const expression = document.getElementById('display').value;
    if (expression === '0721+4545*1111/2222') {
        document.getElementById('popup').style.display = 'flex';
    } else {
        const result = await fetch('/.netlify/functions/calculate', {
            method: 'POST',
            body: JSON.stringify({ expression }),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json());
        document.getElementById('display').value = result;
    }
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

async function submitCredentials() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'glisand' && password === '0721454511112222') {
        const proxyUrl = '/.netlify/functions/proxy?url=https://www.google.com';
        window.open(proxyUrl, '_blank');
        document.getElementById('popup').style.display = 'none';
    } else {
        alert('認証失敗');
    }
}