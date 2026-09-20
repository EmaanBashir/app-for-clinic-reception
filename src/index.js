const { app, BrowserWindow, ipcMain } = require('electron');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let receiptWindow;

const mysql = require('mysql');

ipcMain.handle('login', (event, { username, password }) => {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: null,
      database: 'eyemed_db'
    });

    connection.connect((err) => {
      if (err) {
        console.log(err.stack);
        resolve({
          success: false,
          error: 'Database connection failed'
        });
        return;
      }

      const query = `
        SELECT * FROM Users
        WHERE username = "${username}"
        AND password = PASSWORD("${password}")
      `;

      connection.query(query, (err, rows) => {
        connection.end();

        if (err) {
          console.log('An error occurred performing the query.');
          console.log(err.stack);

          resolve({
            success: false,
            error: 'Database query failed'
          });
          return;
        }

        if (rows.length > 0) {
          resolve({
            success: true,
            name: rows[0].name
          });
        } else {
          resolve({
            success: false,
            error: 'Incorrect Credentials'
          });
        }
      });
    });
  });
});

ipcMain.handle('get-latest-receipt', () => {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: null,
      database: 'eyemed_db'
    });

    connection.connect((err) => {
      if (err) {
        console.log(err.stack);
        resolve({
          success: false,
          error: 'Database connection failed'
        });
        return;
      }

      const consultationQuery = `
        SELECT patientId, consultantId, fee, date, receptionist
        FROM Consultations
        ORDER BY consultationId DESC
        LIMIT 1;
      `;

      connection.query(consultationQuery, (err, consultationRows) => {
        if (err) {
          console.log('An error occurred performing the consultation query.');
          console.log(err.stack);
          connection.end();

          resolve({
            success: false,
            error: 'Consultation query failed'
          });
          return;
        }

        if (consultationRows.length === 0) {
          connection.end();

          resolve({
            success: false,
            error: 'No consultation found'
          });
          return;
        }

        const consultation = consultationRows[0];

        const patientQuery = `
          SELECT * FROM Patients
          WHERE id = "${consultation.patientId}";
        `;

        connection.query(patientQuery, (err, patientRows) => {
          connection.end();

          if (err) {
            console.log('An error occurred performing the patient query.');
            console.log(err.stack);

            resolve({
              success: false,
              error: 'Patient query failed'
            });
            return;
          }

          if (patientRows.length === 0) {
            resolve({
              success: false,
              error: 'Patient not found'
            });
            return;
          }

          resolve({
            success: true,
            consultation,
            patient: patientRows[0]
          });
        });
      });
    });
  });
});

ipcMain.handle('get-consultations', (event, consultantId, month) => {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: null,
      database: 'eyemed_db'
    });

    const query = `
      SELECT Consultations.patientId,
             Patients.name,
             Patients.dob,
             Patients.gender,
             Consultations.date,
             Patients.phone,
             Patients.address,
             Consultations.fee
      FROM Consultations
      INNER JOIN Patients ON Consultations.patientId = Patients.id
      WHERE Consultations.consultantId = "${consultantId}"
      AND DATE_FORMAT(Consultations.date, '%Y-%m') = "${month}"
      ORDER BY Consultations.date;
    `;

    connection.query(query, (err, rows) => {
      connection.end();

      if (err) {
        console.log("An error occurred performing the query.");
        console.log(err.stack);
        resolve({ success: false, error: 'Database query failed' });
        return;
      }

      resolve({
        success: true,
        rows
      });
    });
  });
});

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

ipcMain.handle('get-next-patient-id', () => {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: null,
      database: 'eyemed_db'
    });

    connection.query(
      'SELECT max(id) as id FROM Patients',
      (err, rows) => {
        connection.end();

        if (err) {
          console.log(err.stack);
          resolve({ success: false, error: 'Database query failed' });
          return;
        }

        resolve({
          success: true,
          id: rows[0].id
        });
      }
    );
  });
});

ipcMain.handle('get-patient-by-id', (event, patientId) => {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: null,
      database: 'eyemed_db'
    });

    connection.query(
      `SELECT * FROM Patients WHERE id = '${patientId}'`,
      (err, rows) => {
        connection.end();

        if (err) {
          console.log(err.stack);
          resolve({ success: false, error: 'Database query failed' });
          return;
        }

        resolve({
          success: true,
          patient: rows.length > 0 ? rows[0] : null
        });
      }
    );
  });
});

ipcMain.handle('save-consultation', (event, data) => {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: null,
      database: 'eyemed_db'
    });

    const {
      patientId,
      name,
      dob,
      gender,
      address,
      phone,
      fee,
      consultantId,
      receptionist
    } = data;

    const patientQuery = `SELECT * FROM Patients WHERE id = "${patientId}";`;

    connection.query(patientQuery, (err, rows) => {
      if (err) {
        console.log("An error occurred performing the query.");
        console.log(err.stack);
        connection.end();
        resolve({ success: false, error: 'Patient lookup failed' });
        return;
      }

      let query;

      if (rows.length > 0) {
        query = `UPDATE Patients SET name = "${name}", dob = "${dob}", gender = "${gender}", address = "${address}", phone = "${phone}" WHERE id = "${patientId}";`;
      } else {
        query = `INSERT INTO Patients (id, name, dob, gender, address, phone) VALUES ("${patientId}", "${name}", "${dob}", "${gender}", "${address}", "${phone}");`;
      }

      connection.query(query, (err) => {
        if (err) {
          console.log("An error occurred performing the query.");
          console.log(err.stack);
          connection.end();
          resolve({ success: false, error: 'Patient save failed' });
          return;
        }

        query = `INSERT INTO Consultations
          (patientId, consultantId, fee, receptionist)
          VALUES
          ("${patientId}", "${consultantId}", "${fee}", "${receptionist}");`;

        connection.query(query, (err) => {
          connection.end();

          if (err) {
            console.log("An error occurred performing the query.");
            console.log(err.stack);
            resolve({ success: false, error: 'Consultation save failed' });
            return;
          }

          resolve({ success: true });
        });
      });
    });
  });
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
      devTools: true
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