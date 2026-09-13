/* =========================================================
   ONSITERS — app.js
   Shared helpers used across every dashboard page:
   session handling, the sidebar/topbar shell, JSON loading,
   and small utility functions.
   ========================================================= */

const ONSITERS_SESSION_KEY = "onsiters_session";

/**
 * Reads the logged-in user from sessionStorage.
 * Returns null if nobody is logged in.
 */
function getSession() {
  const raw = sessionStorage.getItem(ONSITERS_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Any page other than index.html should call this first.
 * If there is no active session, it bounces back to the login screen.
 */
function requireSession() {
  const session = getSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  return session;
}

function clearSession() {
  sessionStorage.removeItem(ONSITERS_SESSION_KEY);
}

/** Generates a short fictional session id, e.g. "SES-7F2K9A" */
function generateSessionId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "SES-";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/** Loads a local JSON file from /data. Every page uses this for its dataset. */
async function loadData(fileName) {
  const res = await fetch(`data/${fileName}`);
  if (!res.ok) throw new Error(`Could not load data/${fileName}`);
  return res.json();
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Builds the sidebar + topbar shell and injects it into the page.
 * Call this once per protected page, passing the current nav key
 * ("dashboard" | "search" | "cases" | "people" | "vehicles" | "chat" | "about")
 * and a short page title for the topbar.
 */
function renderShell(activeKey, pageTitle) {
  const session = requireSession();
  if (!session) return null;

  const navItems = [
    { key: "dashboard", label: "Dashboard", href: "dashboard.html" },
    { key: "search", label: "Search", href: "search.html" },
    { key: "cases", label: "Cases", href: "cases.html" },
    { key: "people", label: "People", href: "people.html" },
    { key: "vehicles", label: "Vehicles", href: "vehicles.html" },
    { key: "chat", label: "Chat", href: "chat.html" },
    { key: "about", label: "About", href: "about.html" },
  ];

  const navHtml = navItems
    .map(
      (item) =>
        `<a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">${item.label}</a>`
    )
    .join("");

  const shell = document.createElement("div");
  shell.className = "app-shell";
  shell.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="name">ONSITERS</div>
        <div class="tag">Open Source Investigation Network</div>
      </div>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-foot">
        <div><span class="dot"></span>SYSTEM ONLINE</div>
        <div>SECURE SESSION</div>
        <div id="sidebarSessionId">SES-000000</div>
        <div>Signed in as ${session.displayName}</div>
        <button id="logoutBtn" type="button">Log out</button>
      </div>
    </aside>
    <main class="main">
      <div class="topbar">
        <h1>${pageTitle}</h1>
        <div class="topbar-meta">
          <span class="live">SYSTEM ONLINE</span>
          <span id="topbarClock"></span>
        </div>
      </div>
      <div class="content" id="pageContent"></div>
    </main>
  `;

  document.body.innerHTML = "";
  document.body.appendChild(shell);

  const sessionId = generateSessionId();
  document.getElementById("sidebarSessionId").textContent = sessionId;

  const clockEl = document.getElementById("topbarClock");
  const tick = () => (clockEl.textContent = formatTimestamp());
  tick();
  setInterval(tick, 1000);

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });

  return document.getElementById("pageContent");
}
