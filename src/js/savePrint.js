

//Save receipt data
function saveData() {

    let patientId = document.querySelector('#patientId').value;
    let name = document.querySelector('#patientName').value;
    let dob = document.querySelector('#patientDOB').value;
    let gender = document.querySelector('#patientGender').value;
    let address = document.querySelector('#patientAddress').value;
    let phone = document.querySelector('#patientPhone').value;
    let fee = document.querySelector('#fee').value;
    let consultantId = document.querySelector('#consultant').value;
    let receptionist = document.querySelector('#receptionist').value;

    let query = `SELECT * FROM Patients WHERE id = "${patientId}";`

    connection.query(query, (err, rows, fields) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err.stack);
            return;
        }
        if (rows.length > 0) {
            query = `UPDATE Patients SET name = "${name}", dob = "${dob}", gender = "${gender}", address = "${address}", phone = "${phone}" WHERE id = "${patientId}";`

            connection.query(query, (err, rows, fields) => {
                if (err) {
                    console.log("An error ocurred performing the query.");
                    console.log(err.stack);
                    return;
                }

            });
        } else {
            query = `INSERT INTO Patients (id, name, dob, gender, address, phone) VALUES ("${patientId}", "${name}", "${dob}", "${gender}", "${address}", "${phone}");`

            connection.query(query, (err, rows, fields) => {
                if (err) {
                    console.log("An error ocurred performing the query.");
                    console.log(err.stack);
                    return;
                }
            });
        }
    });

    query = `INSERT INTO Consultations 
    (patientId, consultantId, fee, receptionist) 
    VALUES 
    ("${patientId}", "${consultantId}", "${fee}", "${receptionist}");`


    connection.query(query, (err, rows, fields) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err.stack);
            return;
        }
        printData();
    });
}


//Print the Receipt
function printData() {

    const electron = require('electron');
    const BrowserWindow = electron.remote.BrowserWindow;
    const path = require('path');
    var options = {
        silent: false,
        printBackground: true,
        color: false,
        margin: {
            marginType: 'printableArea'
        },
        landscape: false,
        pagesPerSheet: 1,
        collate: false,
        copies: 1,
        header: 'Header of the Page',
        footer: 'Footer of the Page'
    }

    // Defining a new BrowserWindow Instance
    //Here show = false. So the page will not be displayed. It will just be opened in the backend
    let win = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    //load the page for receipt
    win.loadURL(path.join(__dirname, 'receipt.html'));
}


//Save and print receipt
document.querySelector("#receipt").addEventListener('submit', (e) => {
    saveData();
});


