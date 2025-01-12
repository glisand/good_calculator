// 計算機の機能
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

// 認証機能
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

// プロキシ機能
function executeProxy() {
    let proxyUrl = document.getElementById('proxyUrl').value;

    fetch('/.netlify/functions/proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'proxyRequest',
            url: proxyUrl
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showProxyContent(data.data);
        } else {
            alert('プロキシ実行中にエラーが発生しました: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        alert('プロキシ実行中にエラーが発生しました: ' + error.message);
    });
}

function showProxyContent(htmlContent) {
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
    dialog.style.overflow = 'auto';

    let closeButton = document.createElement('button');
    closeButton.innerText = '閉じる';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.onclick = () => document.body.removeChild(dialog);

    let content = document.createElement('div');
    content.innerHTML = htmlContent;

    dialog.appendChild(closeButton);
    dialog.appendChild(content);

    document.body.appendChild(dialog);
}