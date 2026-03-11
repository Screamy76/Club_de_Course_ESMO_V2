async function getRunners(name) {
    if (!name) return null;
    const url = `./users/${encodeURIComponent(name)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`User ${name} not found or error: ${response.status}`);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch error in getRunners:", error);
        return null;
    }
}

async function getRun(day, code) {
    if (!code) return [];
    const url = `./calendar/${encodeURIComponent(code)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`Calendar for ${code} not found or error: ${response.status}`);
            return [];
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch error in getRun:", error);
        return [];
    }
}

function sundayset(inputDate) {
    const dayOfWeek = inputDate.getDay();
    let sundayOffset;
    if (dayOfWeek === 0) {
        sundayOffset = 0;
    } else {
        sundayOffset = 7 - dayOfWeek;
    }
    const sunday = new Date(inputDate);
    sunday.setDate(inputDate.getDate() + sundayOffset);
    return sunday;
}



var calendar = document.getElementById("calendar");
var Day = document.getElementById("currentWeek");
function getETDate() {
    // This creates a string in ET then turns it back into a Date object 
    // that represents that specific moment in ET.
    return new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
}

// Then use it in your existing code:
const day = getETDate();
day.setDate(day.getDate() - 7);
Day.textContent = "Semaine du " + sundayset(day).toISOString().split('T')[0];
var prev = document.getElementById("prevWeek");
var next = document.getElementById("nextWeek");

var mon = document.getElementById("mon");
var tue = document.getElementById("tue");
var wed = document.getElementById("wed");
var thu = document.getElementById("thu");
var fri = document.getElementById("fri");
var sat = document.getElementById("sat");
var sun = document.getElementById("sun");

function getWeekDates(inputDate) {
    const date = new Date(inputDate);
    const sunday = sundayset(date);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(sunday);
        day.setDate(sunday.getDate() + i);
        weekDates.push(day.toISOString().split('T')[0]); // Format: "2025-05-03"
    }
    return weekDates;
}

// Get this week's dates
const thisWeek = getWeekDates(day);

const getSessionUser = () => {
    const user = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!user) return null;
    try {
        const parsed = JSON.parse(user);
        return parsed.full_name || parsed;
    } catch (e) {
        return user;
    }
};

prev.addEventListener("click", () => {
    day.setDate(sundayset(day).getDate() - 7);
    Day.textContent = "Semaine du " + day.toISOString().split('T')[0];
    const thisWeek = getWeekDates(day);
    (async () => {
        const userName = getSessionUser();
        if (!userName) return;
        const result = await getRunners(userName);  // Get user info (includes race code)
        if (!result) return;
        console.log(userName, result);

        // Get all runs for this user's race
        const allRuns = await getRun(thisWeek[0], result.race);
        if (!allRuns || allRuns.length === 0) return;
        console.log(allRuns);

        // Helper function to find run for a specific date
        function findRunForDate(runs, dateString) {
            const run = runs.find(r => {
                // Convert the run_day to YYYY-MM-DD format for comparison
                const runDate = new Date(r.run_day).toISOString().split('T')[0];
                return runDate === dateString;
            });
            // Return the run value or a default message if not found
            return run ? run[result.race] : "Aucune course prévue";
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
});

next.addEventListener("click", () => {
    day.setDate(sundayset(day).getDate() + 7);
    Day.textContent = "Semaine du " + day.toISOString().split('T')[0];
    const thisWeek = getWeekDates(day);
    (async () => {
        const userName = getSessionUser();
        if (!userName) return;
        const result = await getRunners(userName);  // Get user info (includes race code)
        if (!result) return;
        console.log(userName, result);

        // Get all runs for this user's race
        const allRuns = await getRun(thisWeek[0], result.race);
        if (!allRuns || allRuns.length === 0) return;
        console.log(allRuns);

        // Helper function to find run for a specific date
        function findRunForDate(runs, dateString) {
            const run = runs.find(r => {
                // Convert the run_day to YYYY-MM-DD format for comparison
                const runDate = new Date(r.run_day).toISOString().split('T')[0];
                return runDate === dateString;
            });
            // Return the run value or a default message if not found
            return run ? run[result.race] : "Aucune course prévue";
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
});

// Wrap in an async IIFE (Immediately Invoked Function Expression)
(async () => {
    const userName = getSessionUser();
    if (!userName) {
        console.log("No user found in storage, redirecting to login.");
        window.location.href = "login.html";
        return;
    }

    const result = await getRunners(userName);  // Get user info (includes race code)
    if (!result) {
        console.log("User not found in database, redirecting to login.");
        window.location.href = "login.html";
        return;
    }
    console.log(userName, result);

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
        return run ? run[result.race] : "Aucune course prévue";
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