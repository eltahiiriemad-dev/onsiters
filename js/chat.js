/* =========================================================
   ONSITERS — chat.js
   Loads the fictional seed conversation from data/messages.json
   and lets the logged-in user add their own messages. Nothing is
   saved anywhere — a page refresh resets the conversation back to
   the seed data, since this is a local, single-browser demo only.

   To add more scripted seed messages, edit data/messages.json.
   To add more fictional chat participants, edit data/users.json —
   their displayName will show up here automatically.
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const content = renderShell("chat", "Chat");
  if (!content) return;

  const session = getSession();

  content.innerHTML = `
    <p class="lede">A shared channel for Onsiters analysts to compare notes on open cases.</p>
    <div class="chat-shell">
      <div class="chat-notice">Local demo chat — messages are stored only in this browser session.</div>
      <div class="chat-log" id="chatLog"></div>
      <form class="chat-input-row" id="chatForm">
        <input id="chatInput" type="text" placeholder="Message #onsiters-chat" autocomplete="off" />
        <button type="submit">Send</button>
      </form>
    </div>
  `;

  const logEl = document.getElementById("chatLog");
  const seed = await loadData("messages.json");

  // Keep messages in memory only, seeded from the JSON file each load.
  const messages = [...seed];

  function renderLog() {
    logEl.innerHTML = messages
      .map((m) => {
        const isSelf = m.user === session.displayName;
        return `
          <div class="chat-msg ${isSelf ? "self" : ""}">
            <div class="meta"><span class="user">${escapeHtml(m.user)}</span><span class="time">${m.time}</span></div>
            <div class="text">${escapeHtml(m.text)}</div>
          </div>`;
      })
      .join("");
    logEl.scrollTop = logEl.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function currentTime() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  document.getElementById("chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text) return;
    messages.push({ user: session.displayName, time: currentTime(), text });
    input.value = "";
    renderLog();
  });

  renderLog();
});
