

var submit = document.getElementById('signupForm')

/*let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'CCESMO@outlook.com',
        pass: 'ClubDeC0urse@Michelle'
    }
});*/



async function newRunner(name, run, age) {
    const request1 = new Request("./users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ full_name: name, race: run, grade: age })
    });
    console.log(request1.body);
    const result = await fetch(request1);
    return result
};


async function getRunner() {
    const url = "./users";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error(error.message);
    }
};

submit.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        grade: document.getElementById('grade').value,
        race: document.getElementById('race').value,
    };
    const name = formData.firstName;
    const race = formData.race;
    const grade = formData.grade;

    try {
        const result = await newRunner(name, race, grade);
        if (result.ok) {
            alert("Sign up successful! Please log in.");
            window.location.href = "login.html";
        } else {
            alert("Sign up failed. Please try again.");
        }
    } catch (error) {
        console.error("Error signing up:", error);
        alert("An error occurred. Please try again.");
    }

})
