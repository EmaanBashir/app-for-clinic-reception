const { ipcRenderer } = require('electron');

window.electronAPI = {
    printReceipt: () => ipcRenderer.send('print-receipt'),
    receiptReady: () => ipcRenderer.send('print-receipt-ready'),

    login: (username, password) => ipcRenderer.invoke('login', {
        username,
        password
    })
};