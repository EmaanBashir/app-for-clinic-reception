const { app, BrowserWindow, ipcMain } = require('electron');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

let receiptWindow;

ipcMain.on('print-receipt', () => {

  receiptWindow = new BrowserWindow({
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  });

  receiptWindow.loadFile(`${__dirname}/receipt.html`);

  receiptWindow.webContents.openDevTools();

  receiptWindow.webContents.on('did-finish-load', () => {
  });
});

ipcMain.on('print-receipt-ready', () => {


  if (!receiptWindow) {

    return;
  }



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
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false,
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
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});