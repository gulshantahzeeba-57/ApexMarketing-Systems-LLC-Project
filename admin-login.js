document.addEventListener("DOMContentLoaded", () => {

  // If already logged in this session, skip straight to the dashboard
  if (sessionStorage.getItem("cms_auth") === "true") {
    window.location.href = "admin-dashboard.html";
    return;
  }

  const form = document.getElementById("adminLoginForm");
  const errorMsg = document.getElementById("adminLoginError");

  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "admin123";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("cms_auth", "true");
      window.location.href = "admin-dashboard.html";
    } else {
      errorMsg.classList.add("show");
    }
  });

  // Hide the error as soon as the person starts fixing their input
  ["adminUsername", "adminPassword"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => {
      errorMsg.classList.remove("show");
    });
  });
});
