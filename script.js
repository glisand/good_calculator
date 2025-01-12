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

    // サーバー側でパスワードを検証
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

    // サーバー側でプロキシリクエストを実行
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
    // 新しいダイアログを作成
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

    // 閉じるボタンを追加
    let closeButton = document.createElement('button');
    closeButton.innerText = '閉じる';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.onclick = () => document.body.removeChild(dialog);

    // コンテンツを表示
    let content = document.createElement('div');
    content.innerHTML = htmlContent;

    // ダイアログに追加
    dialog.appendChild(closeButton);
    dialog.appendChild(content);

    // ページに追加
    document.body.appendChild(dialog);
}