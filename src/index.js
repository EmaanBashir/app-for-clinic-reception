const { app, BrowserWindow, ipcMain } = require('electron');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let receiptWindow;

ipcMain.on('print-receipt', () => {
  console.log('1. Received print-receipt');

  receiptWindow = new BrowserWindow({
    show: true,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false
    }
  });

  receiptWindow.loadFile(`${__dirname}/receipt.html`);

  receiptWindow.webContents.openDevTools();

  receiptWindow.webContents.on('did-finish-load', () => {
    console.log('2. Receipt page finished loading');
  });
});

ipcMain.on('print-receipt-ready', () => {
  console.log('3. Received print-receipt-ready');

  if (!receiptWindow) {
    console.log('4. No receipt window exists');
    return;
  }

  console.log('5. Starting print');

  receiptWindow.webContents.print(
    {
      silent: false,
      printBackground: true,
      color: false,
      margin: {
        marginType: 'printableArea'
      },
      landscape: false,
      pagesPerSheet: 1,
      collate: false,
      copies: 1
    },
    (success, failureReason) => {
      console.log('6. Print result:', success, failureReason);

      if (!success) {
        console.log(`Print failed: ${failureReason}`);
      }

      if (receiptWindow && !receiptWindow.isDestroyed()) {
        receiptWindow.close();
      }

      receiptWindow = null;
    }
  );
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    show: false,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false
    }
  });

  mainWindow.maximize();
  mainWindow.show();
  mainWindow.loadURL(`file://${__dirname}/login.html`);
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});