/* =========================================================
   ONSITERS — search.js
   Powers the central search bar. Searches across the fictional
   people, cases, and vehicle datasets by id, name/title,
   location, and category/status keywords.
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const content = renderShell("search", "Search");
  if (!content) return;

  content.innerHTML = `
    <p class="lede">Search the fictional Onsiters database by name, case ID, location, or keyword.</p>
    <div class="search-bar">
      <input id="searchInput" type="text" placeholder="Search the Onsiters database..." autocomplete="off" />
      <button id="searchBtn" type="button">Search</button>
    </div>
    <div id="searchResults"></div>
  `;

  const [people, cases, vehicles] = await Promise.all([
    loadData("people.json"),
    loadData("cases.json"),
    loadData("vehicles.json"),
  ]);

  const input = document.getElementById("searchInput");
  const resultsEl = document.getElementById("searchResults");
  const btn = document.getElementById("searchBtn");

  function matches(haystackParts, query) {
    const text = haystackParts.join(" ").toLowerCase();
    return text.includes(query);
  }

  function runSearch() {
    const query = input.value.trim().toLowerCase();
    resultsEl.innerHTML = "";

    if (!query) {
      resultsEl.innerHTML = `<div class="search-empty">Type a name, case ID, vehicle ID, or location to search.</div>`;
      return;
    }

    const caseHits = cases.filter((c) =>
      matches([c.id, c.title, c.category, c.status, c.location, c.description], query)
    );
    const peopleHits = people.filter((p) =>
      matches([p.id, p.name, p.city, p.country, p.status], query)
    );
    const vehicleHits = vehicles.filter((v) =>
      matches([v.id, v.make, v.model, v.color, v.registration, String(v.year)], query)
    );

    const total = caseHits.length + peopleHits.length + vehicleHits.length;

    if (total === 0) {
      resultsEl.innerHTML = `<div class="search-empty">No records matched "${escapeHtml(input.value.trim())}".</div>`;
      return;
    }

    let html = "";

    if (caseHits.length) {
      html += `<div class="result-group-label">CASES — ${caseHits.length}</div>`;
      html += `<div class="record-list">${caseHits.map(caseRow).join("")}</div>`;
    }
    if (peopleHits.length) {
      html += `<div class="result-group-label">PEOPLE — ${peopleHits.length}</div>`;
      html += `<div class="record-list">${peopleHits.map(personRow).join("")}</div>`;
    }
    if (vehicleHits.length) {
      html += `<div class="result-group-label">VEHICLES — ${vehicleHits.length}</div>`;
      html += `<div class="record-list">${vehicleHits.map(vehicleRow).join("")}</div>`;
    }

    resultsEl.innerHTML = html;
  }

  function caseRow(c) {
    return `
      <a class="record-row" href="cases.html?id=${encodeURIComponent(c.id)}">
        <div class="record-main">
          <div class="id">${c.id}</div>
          <div class="title">${escapeHtml(c.title)}</div>
          <div class="sub">${c.category} · ${c.location} · ${c.date}</div>
        </div>
        <span class="pill ${statusClass(c.status)}">${c.status}</span>
        <span class="link-arrow">VIEW →</span>
      </a>`;
  }

  function personRow(p) {
    return `
      <a class="record-row" href="people.html?id=${encodeURIComponent(p.id)}">
        <div class="record-main">
          <div class="id">${p.id}</div>
          <div class="title">${escapeHtml(p.name)}</div>
          <div class="sub">${p.city}, ${p.country} · age ${p.age}</div>
        </div>
        <span class="pill ${statusClass(p.status)}">${p.status}</span>
        <span class="link-arrow">VIEW →</span>
      </a>`;
  }

  function vehicleRow(v) {
    return `
      <a class="record-row" href="vehicles.html?id=${encodeURIComponent(v.id)}">
        <div class="record-main">
          <div class="id">${v.id}</div>
          <div class="title">${v.year} ${escapeHtml(v.make)} ${escapeHtml(v.model)}</div>
          <div class="sub">${v.color} · ${v.registration}</div>
        </div>
        <span class="link-arrow">VIEW →</span>
      </a>`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  btn.addEventListener("click", runSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });

  // Support ?q= links coming from other pages (e.g. related-case chips)
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q");
  if (initialQuery) {
    input.value = initialQuery;
    runSearch();
  } else {
    resultsEl.innerHTML = `<div class="search-empty">Type a name, case ID, vehicle ID, or location to search.</div>`;
  }
});
