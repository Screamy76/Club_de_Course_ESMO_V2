async function getRunners(name) {
    const url = `./users/${name}`;
    const response = await fetch(url);
    const data = await response.json();
    return data
};

async function getRun(day, code) {
    const url = `./calendar/${code}`;
    const response = await fetch(url);
    const data = await response.json();
    const tday = data;
    return data
};



var calendar = document.getElementById("calendar");
var Day = document.getElementById("currentMonth");
const day = new Date();
Day.textContent = "Week of " + day.toISOString().split('T')[0];

var mon = document.getElementById("mon");
var tue = document.getElementById("tue");
var wed = document.getElementById("wed");
var thu = document.getElementById("thu");
var fri = document.getElementById("fri");
var sat = document.getElementById("sat");
var sun = document.getElementById("sun");

function getWeekDates(inputDate) {
    const date = new Date(inputDate);
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        weekDates.push(day.toISOString().split('T')[0]); // Format: "2025-05-03"
    }
    return weekDates;
}

// Get this week's dates
const thisWeek = getWeekDates(new Date());

// Wrap in an async IIFE (Immediately Invoked Function Expression)
(async () => {
    const user = localStorage.getItem("user");
    const result = await getRunners(user);  // Get user info (includes race code)
    console.log(user, result);
    
    // Get all runs for this user's race
    const allRuns = await getRun(thisWeek[0], result.race);
    console.log(allRuns);
    
    // Helper function to find run for a specific date
    function findRunForDate(runs, dateString) {
        const run = runs.find(r => {
            // Convert the run_day to YYYY-MM-DD format for comparison
            const runDate = new Date(r.run_day).toISOString().split('T')[0];
            return runDate === dateString;
        });
        // Return the run value or a default message if not found
        return run ? run[result.race] : "No run scheduled";
    }
    
    // Assign to your table cells
    mon.textContent = findRunForDate(allRuns, thisWeek[0]);
    tue.textContent = findRunForDate(allRuns, thisWeek[1]);
    wed.textContent = findRunForDate(allRuns, thisWeek[2]);
    thu.textContent = findRunForDate(allRuns, thisWeek[3]);
    fri.textContent = findRunForDate(allRuns, thisWeek[4]);
    sat.textContent = findRunForDate(allRuns, thisWeek[5]);
    sun.textContent = findRunForDate(allRuns, thisWeek[6]);
})();