var submit = document.getElementById("loginform");

async function getRunners(name) {
    const url = `./users/${name}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data
};

submit.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById("name").value,
        remember: document.getElementById("remember").value
    }

    try {
        const result = await getRunners(formData.name);

        if (result) {
            sessionStorage.setItem('user', formData.name);
            console.log("Logged in as: " + formData.name);

            if (document.getElementById("remember").checked) {
                localStorage.setItem("user", formData.name);
            }

            alert("Welcome back, " + formData.name + "!");
            window.location.href = "runs.html";
        } else {
            alert("User not found. Please sign up first.");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
    }
});