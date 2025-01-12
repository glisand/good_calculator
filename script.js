let display = document.getElementById('display');
let popup = document.getElementById('popup');
let urlInput = document.getElementById('urlInput');

function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
}

function calculate() {
    let expression = display.value;
    if (expression === '0721+4545*1111/2222') {
        fetch('/.netlify/functions/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expression: expression })
        })
        .then(response => response.json())
        .then(data => {
            if (data.popup) {
                popup.style.display = 'block';
            }
        });
    } else {
        try {
            display.value = eval(expression);
        } catch (e) {
            display.value = 'Error';
        }
    }
}

function submitCredentials() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    if (username === 'glisand' && password === '0721454511112222') {
        urlInput.style.display = 'block';
    } else {
        alert('??');
    }
}

function executeProxy() {
    let proxyUrl = document.getElementById('proxyUrl').value;
    fetch('/.netlify/functions/proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: proxyUrl })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    });
}