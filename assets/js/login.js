document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "admin" && password === "admin123") {
        localStorage.setItem("wqms_admin_logged_in", "true");
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("loginError").textContent = "Invalid username or password.";
    }
});
