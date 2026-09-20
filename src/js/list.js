let gender, totalFee;

// Function to load data from db
let loadData = async (consultantId, month) => {
    document.querySelector('#tbody1').innerHTML = "";

    const result = await window.electronAPI.getConsultations(
        consultantId,
        month
    );

    if (!result.success) {
        console.log(result.error);
        return;
    }

    totalFee = 0;

    for (let i = 0; i < result.rows.length; i++) {
        switch (result.rows[i].gender) {
            case 'm':
                gender = "male";
                break;
            case 'f':
                gender = "female";
                break;
            default:
                gender = "-";
        }

        totalFee += result.rows[i].fee;

        document.querySelector('#tbody1').innerHTML += `
                    <tr>
                        <th scope="row">${result.rows[i].patientId}</th>
                        <td>${result.rows[i].name}</td>
                        <td>${result.rows[i].dob ? new Date(result.rows[i].dob).toLocaleDateString('en-GB') : '-'}</td>
                        <td>${gender}</td>
                        <td>${new Date(result.rows[i].date).toDateString()}</td>
                        <td>${result.rows[i].phone ? result.rows[i].phone : '-'}</td>
                        <td>${result.rows[i].address ? result.rows[i].address : '-'}</td>
                        <td>${result.rows[i].fee}</td>
                    </tr>`;
    }

    document.querySelector("#total1").innerHTML = totalFee;
};

// Event listener for consultant change
let consultantSelect = document.querySelector("#consultant");
let monthSelect = document.querySelector("#month");

consultantSelect.addEventListener('change', () => {
    loadData(consultantSelect.value, monthSelect.value);
});

// Event listener for month change
monthSelect.addEventListener('change', () => {
    loadData(consultantSelect.value, monthSelect.value);
});

// Load data when the page is loaded
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

// Event Listener for print
printBtn.addEventListener('click', () => {
    backBtn.style.display = "none";
    printBtn.style.display = "none";
    containerLg.classList.remove("p-5");
    containerLg.classList.remove("mt-5");

    window.print();

    containerLg.classList.add("p-5");
    containerLg.classList.add("mt-5");
    backBtn.style.display = "inline";
    printBtn.style.display = "inline";
});