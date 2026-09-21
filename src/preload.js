const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    printReceipt: () => ipcRenderer.send('print-receipt'),
    receiptReady: () => ipcRenderer.send('print-receipt-ready'),

    login: (username, password) => ipcRenderer.invoke('login', {
        username,
        password
    }),

    getLatestReceipt: () => ipcRenderer.invoke('get-latest-receipt'),

    getNextPatientId: () => ipcRenderer.invoke('get-next-patient-id'),

    getNextReceiptId: () => ipcRenderer.invoke('get-next-receipt-id'),

    getPatientById: (patientId) => ipcRenderer.invoke('get-patient-by-id', patientId),

    saveConsultation: (data) => ipcRenderer.invoke('save-consultation', data),

    getConsultations: (consultantId, month) =>
        ipcRenderer.invoke('get-consultations', consultantId, month)
});