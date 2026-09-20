//Establish MySQL connection
let sql = require('mysql');

let conn = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'eyemed_db'
});

conn.connect((err) => {
    if (err) {
        console.log(err.stack);
    }
    console.log("Connection successful");
});

let gender, totalFee;
//Function to load data from db
let loadData = (consultantId, month) => {
    let selectedMonth = new Date(month).getMonth();
    let selectedYear = new Date(month).getFullYear();
    document.querySelector('#tbody1').innerHTML = "";
    let q = `SELECT * FROM Consultations INNER JOIN Patients ON patientId = id WHERE consultantId = "${consultantId}" AND YEAR(Consultations.date) = "${selectedYear}" AND MONTH(Consultations.date) = "${selectedMonth + 1}" ORDER BY consultationId DESC;`;

    conn.query(q, (err, rows, fields) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err.stack);
            return;
        }
        totalFee = 0;
        for (let i = 0; i < rows.length; i++) {
            switch (rows[i].gender) {
                case 'm':
                    gender = "male";
                    break;
                case 'f':
                    gender = "female";
                    break;
                default:
                    gender = "-";
            }
            totalFee += rows[i].fee;
            document.querySelector('#tbody1').innerHTML += `
                        <tr>
                            <th scope="row">${rows[i].patientId}</th>
                            <td>${rows[i].name}</td>
                            <td>${rows[i].dob ? rows[i].dob.toLocaleDateString('en-GB') : '-'}</td>
                            <td>${gender}</td>
                            <td>${rows[i].date.toDateString()}</td>
                            <td>${rows[i].phone ? rows[i].phone : '-'}</td>
                            <td>${rows[i].address ? rows[i].address : '-'}</td>
                            <td>${rows[i].fee}</td>
                        </tr>`;
        }
        document.querySelector("#total1").innerHTML = totalFee;
    });

};

//Event listener for consultant change
let consultantSelect = document.querySelector("#consultant");
let monthSelect = document.querySelector("#month");
consultantSelect.addEventListener('change', () => {
    loadData(consultantSelect.value, monthSelect.value);
});

//Event listener for month change
monthSelect.addEventListener('change', () => {
    loadData(consultantSelect.value, monthSelect.value);
});

//Load data when the page is loaded
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let dash = currentMonth < 10 ? "-0" : "-";
let reqMonth = String(currentYear + dash + (currentMonth + 1));
monthSelect.value = reqMonth;
loadData(0, reqMonth);
let backBtn = document.querySelector("#backBtn");
let printBtn = document.querySelector("#printBtn");
let containerLg = document.querySelector(".container-lg");

//Event Listener for print
printBtn.addEventListener('click', () => {
    backBtn.style.display = "none";
    printBtn.style.display = "none";
    containerLg.classList.remove("p-5");
    containerLg.classList.remove("mt-5");
    window.print();
    containerLg.classList.add("p-5");
    containerLg.classList.add("mt-5");
    backBtn.style.display = "inline";
    printBtn.style.display = "inline"
})