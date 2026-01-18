document.addEventListener("DOMContentLoaded", function () {
    const user = sessionStorage.getItem("user") || localStorage.getItem("user");
    const nav = document.querySelector("nav");

    if (user && nav) {
        // Find existing Login link
        const loginLink = nav.querySelector('a[href="login.html"]');

        if (loginLink) {
            // Remove Login link
            loginLink.remove();

            // Create User Name element
            const userSpan = document.createElement("span");
            userSpan.textContent = `Hi, ${user}`;
            userSpan.style.color = "var(--accent-green)"; // Use theme color
            userSpan.style.fontWeight = "600";
            userSpan.style.marginRight = "1rem";
            userSpan.style.alignSelf = "center";

            // Create Sign Out button
            const signOutBtn = document.createElement("a");
            signOutBtn.href = "#";
            signOutBtn.textContent = "Sign Out";
            signOutBtn.className = "btn-logout"; // We can style this or reuse existing classes
            // Inline style for immediate feedback, but class is better
            signOutBtn.style.border = "1px solid white";
            signOutBtn.style.padding = "0.4rem 1rem";
            signOutBtn.style.borderRadius = "20px";
            signOutBtn.style.fontSize = "0.9rem";

            signOutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                sessionStorage.removeItem("user");
                localStorage.removeItem("user");
                window.location.href = "index.html";
            });

            // Append new items
            nav.appendChild(userSpan);
            nav.appendChild(signOutBtn);
        }
    }
});
