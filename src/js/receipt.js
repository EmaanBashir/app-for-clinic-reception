//Establish MySQL Connection
let mysq = require('mysql');

let connection = mysq.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'eyemed_db'
});

connection.connect((err) => {
    if (err) {
        console.log(err.stack);
    }
    console.log("Connection successful");
});

//Get the latest consultation from the db to print it
let mrNo;

let quer = `
        SELECT patientId, consultantId, fee, date, receptionist
        FROM Consultations
        ORDER BY consultationId DESC
        LIMIT 1;`;


connection.query(quer, (err, rows, fields) => {
    if (err) {
        console.log("An error ocurred performing the query.");
        console.log(err.stack);
        return;
    }

    mrNo = rows[0].patientId;
    let dateTime = new Date(rows[0].date).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.querySelector("#mrNo").innerHTML = mrNo;
    document.querySelector("#date").innerHTML = dateTime;
    document.querySelector("#fee").innerHTML = rows[0].fee;
    document.querySelector("#mrNo1").innerHTML = mrNo;
    document.querySelector("#date1").innerHTML = dateTime;
    document.querySelector("#fee1").innerHTML = rows[0].fee;
    document.querySelector("#receptionist").innerHTML = rows[0].receptionist || '';
    document.querySelector("#receiptDateTime").innerHTML = dateTime;

    switch (rows[0].consultantId) {
        case 0:
            document.querySelector("#consultant").innerHTML = "Dr. Hamid Bashir";
            document.querySelector("#speciality").innerHTML = "Medical Specialist";
            document.querySelector("#consultant1").innerHTML = "Dr. Hamid Bashir";
            document.querySelector("#speciality1").innerHTML = "Medical Specialist";
            break;
        case 1:
            document.querySelector("#consultant").innerHTML = "Dr. Naeem Altaf";
            document.querySelector("#speciality").innerHTML = "Eye Specialist";
            document.querySelector("#consultant1").innerHTML = "Dr. Naeem Altaf";
            document.querySelector("#speciality1").innerHTML = "Eye Specialist";
            break;
    }

    //Get the details of the latest patient
    quer = `SELECT * FROM Patients WHERE id = "${mrNo}"`;

    connection.query(quer, (err, rows, fields) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err.stack);
            return;
        }
        document.querySelector("#dob").innerHTML = rows[0].dob ? rows[0].dob.toLocaleDateString('en-GB') : '-';
        document.querySelector("#address").innerHTML = rows[0].address ? rows[0].address : '-';
        document.querySelector("#phone").innerHTML = rows[0].phone ? rows[0].phone : '-';
        document.querySelector("#dob1").innerHTML = rows[0].dob ? rows[0].dob.toLocaleDateString('en-GB') : '-';
        document.querySelector("#address1").innerHTML = rows[0].address ? rows[0].address : '-';
        document.querySelector("#phone1").innerHTML = rows[0].phone ? rows[0].phone : '-';
        switch (rows[0].gender) {
            case 'm':
                document.querySelector("#gender").innerHTML = 'male';
                document.querySelector("#gender1").innerHTML = 'male';
                break;
            case 'f':
                document.querySelector("#gender").innerHTML = 'female';
                document.querySelector("#gender1").innerHTML = 'female';
                break;
            default:
                document.querySelector("#gender").innerHTML = '-';
                document.querySelector("#gender1").innerHTML = '-';
        }
        document.querySelector("#name").innerHTML = rows[0].name;
        document.querySelector("#name1").innerHTML = rows[0].name;

        // Tell the main Electron process that the receipt is ready to print
        window.electronAPI.receiptReady();

    });

});

