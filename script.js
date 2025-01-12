function executeProxy() {
    let proxyUrl = document.getElementById('proxyUrl').value;

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
    iframe.src = `/.netlify/functions/proxy?url=${encodeURIComponent(proxyUrl)}`;
    iframe.style.width = '100%';
    iframe.style.height = 'calc(100% - 40px)';
    iframe.style.border = 'none';

    dialog.appendChild(closeButton);
    dialog.appendChild(iframe);

    document.body.appendChild(dialog);
}