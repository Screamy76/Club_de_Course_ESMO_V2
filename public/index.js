const link = document.getElementById("calendar");

const name = sessionStorage.getItem("user");
if (name === NULL){
    link.href = ""
    const but = document.getElementById("runs");
    but.textContent = "Check the run dependant calendars"
} else {
    link.href = "runs.js";
};