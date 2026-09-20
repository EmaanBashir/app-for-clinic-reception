

// Save receipt data
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

    let query = `SELECT * FROM Patients WHERE id = "${patientId}";`;

    connection.query(query, (err, rows) => {
        if (err) {
            console.log("An error occurred performing the query.");
            console.log(err.stack);
            return;
        }

        if (rows.length > 0) {
            query = `UPDATE Patients SET name = "${name}", dob = "${dob}", gender = "${gender}", address = "${address}", phone = "${phone}" WHERE id = "${patientId}";`;
        } else {
            query = `INSERT INTO Patients (id, name, dob, gender, address, phone) VALUES ("${patientId}", "${name}", "${dob}", "${gender}", "${address}", "${phone}");`;
        }

        connection.query(query, (err) => {
            if (err) {
                console.log("An error occurred performing the query.");
                console.log(err.stack);
                return;
            }

            // Patient has now been saved.
            // Save the consultation next.
            query = `INSERT INTO Consultations
                (patientId, consultantId, fee, receptionist)
                VALUES
                ("${patientId}", "${consultantId}", "${fee}", "${receptionist}");`;

            connection.query(query, (err) => {
                if (err) {
                    console.log("An error occurred performing the query.");
                    console.log(err.stack);
                    return;
                }

                // Both database operations have completed.
                printData();

                // Return the reception form to its initial state.
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            });
        });
    });
}


// Print the receipt
function printData() {
    window.electronAPI.printReceipt();
}


// Save and print receipt
document.querySelector("#receipt").addEventListener('submit', (e) => {
    e.preventDefault();
    saveData();
});