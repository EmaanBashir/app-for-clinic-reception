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

    const data = {
        patientId,
        name,
        dob,
        gender,
        address,
        phone,
        fee,
        consultantId,
        receptionist
    };

    window.electronAPI.saveConsultation(data).then((result) => {
        if (!result.success) {
            console.log(result.error);
            return;
        }

        printData();

        setTimeout(() => {
            window.location.reload();
        }, 500);
    });
}

function printData() {
    window.electronAPI.printReceipt();
}

document.querySelector("#receipt").addEventListener('submit', (e) => {
    e.preventDefault();
    saveData();
});