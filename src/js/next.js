// Get the next MR number
let idInput = document.querySelector("#patientId");
let nextPatientId = null;
let validOldPatient = false;

window.electronAPI.getNextPatientId().then((result) => {
    if (!result.success) {
        console.log(result.error);
        return;
    }

    nextPatientId = result.id;
    idInput.value = nextPatientId;
});

// Get the next receipt number
let receiptNoDisplay = document.querySelector("#receiptNo");

window.electronAPI.getNextReceiptId().then((result) => {
    if (!result.success) {
        console.log(result.error);
        return;
    }

    receiptNoDisplay.textContent =
        result.id === null ? 1 : result.id + 1;
});

let patientDOB = document.querySelector("#patientDOB");
let patientGender = document.querySelector("#patientGender");
let patientName = document.querySelector("#patientName");
let patientAddress = document.querySelector("#patientAddress");
let patientPhone = document.querySelector("#patientPhone");
let changed = false;

// Old patient checkbox
let checkbox = document.querySelector("#old");

checkbox.addEventListener('change', () => {
    let old = checkbox.checked;

    if (old) {
        idInput.removeAttribute('disabled');
        idInput.value = '';
        validOldPatient = false;
        idInput.setCustomValidity('Please enter a valid existing MR number.');
        idInput.focus();
    } else {
        idInput.setAttribute('disabled', '');
        idInput.value = nextPatientId;
        validOldPatient = false;
        idInput.setCustomValidity('');

        if (changed) {
            patientDOB.value = patientDOB.defaultValue;
            patientGender.value = patientGender.defaultValue;
            patientName.value = patientName.defaultValue;
            patientAddress.value = patientAddress.defaultValue;
            patientPhone.value = patientPhone.defaultValue;
            changed = false;
        }
    }
});

// Auto fill patient info when an existing MR number is entered
idInput.addEventListener('keyup', () => {
    let patientId = idInput.value.trim();

    validOldPatient = false;
    idInput.setCustomValidity('Please enter a valid existing MR number.');

    if (changed) {
        patientDOB.value = patientDOB.defaultValue;
        patientGender.value = patientGender.defaultValue;
        patientName.value = patientName.defaultValue;
        patientAddress.value = patientAddress.defaultValue;
        patientPhone.value = patientPhone.defaultValue;
        changed = false;
    }

    if (!checkbox.checked || !patientId) {
        return;
    }

    // Check that the MR number has the correct format:
    // YYYY/MM/0000
    const mrPattern = /^\d{4}\/\d{2}\/\d{4}$/;

    if (!mrPattern.test(patientId)) {
        return;
    }

    window.electronAPI.getPatientById(patientId).then((result) => {
        if (!result.success) {
            console.log(result.error);
            return;
        }

        if (result.patient) {
            let patient = result.patient;

            patientDOB.value = patient.dob
                ? new Date(patient.dob).toISOString().split('T')[0]
                : '';

            patientGender.value = patient.gender;
            patientName.value = patient.name;
            patientAddress.value = patient.address;
            patientPhone.value = patient.phone;

            validOldPatient = true;
            idInput.setCustomValidity('');
            changed = true;
        }
    });
});