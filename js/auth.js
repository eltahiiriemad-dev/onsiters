/* =========================================================
   ONSITERS — auth.js
   Handles the login screen. Checks the entered username and
   access code against data/users.json (fictional demo users).

   To add more demo users, open data/users.json and add another
   object with a unique "username", an "accessCode", and a
   "displayName" (used in the chat page and sidebar).
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // If someone is already logged in, skip straight to the dashboard.
  if (getSession()) {
    window.location.href = "dashboard.html";
    return;
  }

  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");
  const sessionTag = document.getElementById("loginSessionId");
  if (sessionTag) sessionTag.textContent = generateSessionId();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const username = document.getElementById("username").value.trim();
    const accessCode = document.getElementById("accessCode").value.trim();

    if (!username || !accessCode) {
      errorEl.textContent = "Enter a username and access code.";
      return;
    }

    let users;
    try {
      users = await loadData("users.json");
    } catch (e) {
      errorEl.textContent = "Could not reach the local user database.";
      return;
    }

    const match = users.find(
      (u) => u.username === username && u.accessCode === accessCode
    );

    if (!match) {
      errorEl.textContent = "Username or access code not recognized.";
      return;
    }

    sessionStorage.setItem(ONSITERS_SESSION_KEY, JSON.stringify(match));
    window.location.href = "dashboard.html";
  });
});
