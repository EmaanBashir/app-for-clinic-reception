const { app, BrowserWindow, ipcMain } = require('electron');
const mysql = require('mysql');

function initializeDatabase() {
  return new Promise((resolve, reject) => {
      // First connect to MySQL without selecting a database.
      const connection = mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: null
      });

      connection.connect((err) => {
          if (err) {
              console.log('Unable to connect to MySQL:', err);
              reject(err);
              return;
          }

          // Create the application database if it does not already exist.
          connection.query(
              `CREATE DATABASE IF NOT EXISTS eyemed_db
               DEFAULT CHARACTER SET utf8mb4
               COLLATE utf8mb4_general_ci`,
              (err) => {
                  if (err) {
                      console.log('Unable to create database:', err);
                      connection.end();
                      reject(err);
                      return;
                  }

                  connection.end();

                  // Now connect to the newly created/existing database.
                  const db = mysql.createConnection({
                      host: 'localhost',
                      user: 'root',
                      password: null,
                      database: 'eyemed_db'
                  });

                  db.connect((err) => {
                      if (err) {
                          console.log('Unable to connect to eyemed_db:', err);
                          reject(err);
                          return;
                      }

                      const createPatientsTable = `
                          CREATE TABLE IF NOT EXISTS Patients (
                              id int(7) NOT NULL AUTO_INCREMENT,
                              name varchar(30) NOT NULL,
                              dob date DEFAULT NULL,
                              gender char(1) DEFAULT NULL,
                              phone bigint(20) DEFAULT NULL,
                              address varchar(50) DEFAULT NULL,
                              PRIMARY KEY (id)
                          ) ENGINE=InnoDB
                          DEFAULT CHARSET=utf8mb4
                          COLLATE=utf8mb4_general_ci
                      `;

                      const createConsultationsTable = `
                          CREATE TABLE IF NOT EXISTS Consultations (
                              consultationId int(11) NOT NULL AUTO_INCREMENT,
                              patientId int(11) NOT NULL,
                              consultantId int(11) NOT NULL,
                              fee int(20) NOT NULL,
                              date datetime NOT NULL DEFAULT current_timestamp(),
                              receptionist varchar(30) DEFAULT NULL,
                              PRIMARY KEY (consultationId)
                          ) ENGINE=InnoDB
                          DEFAULT CHARSET=utf8mb4
                          COLLATE=utf8mb4_general_ci
                      `;

                      const createUsersTable = `
                          CREATE TABLE IF NOT EXISTS Users (
                              username varchar(20) NOT NULL,
                              password varchar(45) NOT NULL,
                              name varchar(30) NOT NULL,
                              PRIMARY KEY (username)
                          ) ENGINE=InnoDB
                          DEFAULT CHARSET=utf8mb4
                          COLLATE=utf8mb4_general_ci
                      `;

                      db.query(createPatientsTable, (err) => {
                          if (err) {
                              console.log('Unable to create patients table:', err);
                              db.end();
                              reject(err);
                              return;
                          }

                          db.query(createConsultationsTable, (err) => {
                              if (err) {
                                  console.log('Unable to create consultations table:', err);
                                  db.end();
                                  reject(err);
                                  return;
                              }

                              db.query(createUsersTable, (err) => {
                                  if (err) {
                                      console.log('Unable to create users table:', err);
                                      db.end();
                                      reject(err);
                                      return;
                                  }

                                  // Create the first user only if the users
                                  // table is currently empty.
                                  const firstUser = `
                                      INSERT INTO Users (username, password, name)
                                      SELECT 'eyemed',
                                             '*B1F54CD885D1BFCEA968F2F22E2BE96051D7C4A4',
                                             'Wajid'
                                      WHERE NOT EXISTS (
                                          SELECT 1 FROM users
                                      )
                                  `;

                                  db.query(firstUser, (err) => {
                                      db.end();

                                      if (err) {
                                          console.log('Unable to create first user:', err);
                                          reject(err);
                                          return;
                                      }

                                      console.log('Database initialization complete.');
                                      resolve();
                                  });
                              });
                          });
                      });
                  });
              }
          );
      });
  });
}

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let receiptWindow;



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
        SELECT consultationId, patientId, consultantId, fee, date, receptionist
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
      contextIsolation: true,
      devTools: false
    }
  });

  receiptWindow.loadFile(`${__dirname}/receipt.html`);


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

ipcMain.handle('get-next-receipt-id', () => {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: null,
      database: 'eyemed_db'
    });

    connection.query(
      'SELECT max(consultationId) as id FROM Consultations',
      (err, rows) => {
        connection.end();

        if (err) {
          console.log(err.stack);
          resolve({
            success: false,
            error: 'Database query failed'
          });
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
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false
    }
  });

  mainWindow.maximize();
  mainWindow.show();
  mainWindow.loadURL(`file://${__dirname}/login.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', async () => {
  try {
    await initializeDatabase();
    createWindow();
  } catch (err) {
    console.log('Database initialization failed:', err);
  }
});

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