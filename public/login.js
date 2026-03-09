var submit = document.getElementById("loginform");

async function getRunners(name) {
    if (!name) return null;
    const url = `./users/${name}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`User ${name} not found or error: ${response.status}`);
            return null;
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Fetch error in getRunners:", error);
        return null;
    }
}

submit.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById("name").value,
        remember: document.getElementById("remember").value
    }

    try {
        const result = await getRunners(formData.name);

        if (result) {
            const userData = JSON.stringify(result);
            sessionStorage.setItem('user', userData);
            console.log("Connecte en tant que: " + result.full_name);

            if (document.getElementById("remember").checked) {
                localStorage.setItem("user", userData);
            }

            alert("Bienvenue, " + result.full_name + "!");
            window.location.href = "runs.html";
        } else {
            alert("Utilisateur non trouve. Veuillez vous inscrire.");
        }
    } catch (error) {
        console.error("Erreur de connexion:", error);
        alert("Connexion reussie. Veuillez réessayer.");
    }
});