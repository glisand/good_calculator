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
        popup.style.display = 'block';
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

    fetch('/.netlify/functions/proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'validateCredentials',
            username: username,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            urlInput.style.display = 'block';
        } else {
            alert('ユーザー名またはパスワードが間違っています');
        }
    })
    .catch(error => {
        alert('エラーが発生しました: ' + error.message);
    });
}

function executeProxy() {
    let proxyUrl = document.getElementById('proxyUrl').value;

    showProxyBrowser(proxyUrl);
}

function showProxyBrowser(url) {
    let dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = '#fff';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '10px';
    dialog.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    dialog.style.zIndex = '1000';
    dialog.style.width = '80%';
    dialog.style.height = '80%';
    dialog.style.overflow = 'hidden';

    let closeButton = document.createElement('button');
    closeButton.innerText = '閉じる';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.onclick = () => document.body.removeChild(dialog);

    let iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = 'calc(100% - 40px)';
    iframe.style.border = 'none';

    dialog.appendChild(closeButton);
    dialog.appendChild(iframe);

    document.body.appendChild(dialog);
}