var submit = document.getElementById("loginform");

async function getRunners(name) {
    const url = `./users/${name}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data
};

submit.addEventListener("submit", function (e){
    e.preventDefault();

    const formData = {
        name : document.getElementById("name").value,
        remember : document.getElementById("remember").value
    }

    const result = getRunners(formData.name);
    sessionStorage.setItem('user', formData.name);
    const name = sessionStorage.getItem("user");
    console.log(name)
    if(formData.remember){
        // Set the variable (in any JS file)
        localStorage.setItem("user", formData.name);

        // Get the variable (in any other JS file)
        const name = localStorage.getItem("user");
        console.log(name);

    }
});