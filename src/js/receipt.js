window.electronAPI.getLatestReceipt().then((result) => {
    if (!result.success) {
        console.log(result.error);
        return;
    }

    const consultation = result.consultation;
    const patient = result.patient;

    const mrNo = consultation.patientId;

    const dateTime = new Date(consultation.date).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    document.querySelector("#mrNo").innerHTML = mrNo;
    document.querySelector("#date").innerHTML = dateTime;
    document.querySelector("#fee").innerHTML = consultation.fee;
    document.querySelector("#mrNo1").innerHTML = mrNo;
    document.querySelector("#date1").innerHTML = dateTime;
    document.querySelector("#fee1").innerHTML = consultation.fee;
    document.querySelector("#receptionist").innerHTML = consultation.receptionist || '';
    document.querySelector("#receptionist1").innerHTML = consultation.receptionist || '';

    switch (consultation.consultantId) {
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

    document.querySelector("#dob").innerHTML =
        patient.dob ? new Date(patient.dob).toLocaleDateString('en-GB') : '-';

    document.querySelector("#address").innerHTML =
        patient.address ? patient.address : '-';

    document.querySelector("#phone").innerHTML =
        patient.phone ? patient.phone : '-';

    document.querySelector("#dob1").innerHTML =
        patient.dob ? new Date(patient.dob).toLocaleDateString('en-GB') : '-';

    document.querySelector("#address1").innerHTML =
        patient.address ? patient.address : '-';

    document.querySelector("#phone1").innerHTML =
        patient.phone ? patient.phone : '-';

    switch (patient.gender) {
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

    document.querySelector("#name").innerHTML = patient.name;
    document.querySelector("#name1").innerHTML = patient.name;

    // Tell the main Electron process that the receipt is ready to print.
    window.electronAPI.receiptReady();
});