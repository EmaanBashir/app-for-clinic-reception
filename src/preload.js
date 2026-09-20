const { ipcRenderer } = require('electron');

window.electronAPI = {
    printReceipt: () => ipcRenderer.send('print-receipt'),
    receiptReady: () => ipcRenderer.send('print-receipt-ready'),

    login: (username, password) => ipcRenderer.invoke('login', {
        username,
        password
    }),

    getLatestReceipt: () => ipcRenderer.invoke('get-latest-receipt'),

getConsultations: (consultantId, month) =>
    ipcRenderer.invoke('get-consultations', {
        consultantId,
        month
    })
};