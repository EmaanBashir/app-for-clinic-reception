document.querySelector("#login").addEventListener('click', async (e) => {
    e.preventDefault();

    const usernameField = document.querySelector("#username");
    const passwordField = document.querySelector("#password-field");

    const username = usernameField.value;
    const password = passwordField.value;

    const result = await window.electronAPI.login(username, password);

    if (result.success) {
        sessionStorage.setItem("receptionistName", result.name);
        window.location.href = "./index.html";
    } else {
        document.querySelector("#error").innerHTML = result.error;
    }
});