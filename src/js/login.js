document.querySelector("#login").addEventListener('click', (e) => {
    e.preventDefault();

    let usernameField = document.querySelector("#username");
    let passwordField = document.querySelector("#password-field");

    let username = usernameField.value;
    let password = passwordField.value;

    let mysql = require('mysql');

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: null,
        database: 'eyemed_db'
    });

    connection.connect((err) => {
        if (err) {
            console.log(err.stack);
            return;
        }

        console.log("Connection successful");
    });

    let query = `SELECT * FROM Users WHERE username = "${username}" AND password = PASSWORD("${password}")`;

    connection.query(query, (err, rows, fields) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err.stack);
            return;
        }

        if (rows.length > 0) {

            // Save the logged-in user's name
            sessionStorage.setItem("receptionistName", rows[0].name);

            window.location.href = "./index.html";

        } else {
            document.querySelector("#error").innerHTML = "Incorrect Credentials";
        }
    });
});
