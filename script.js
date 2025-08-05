const CSV_MATCH = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv"; // Remplace par ton vrai lien
const CSV_JOUEUR = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=1528731943&single=true&output=csv"; // Remplace par ton vrai lien

const container = document.getElementById("table-container");
let currentView = "match";

function createToggleButton() {
  const btn = document.createElement("button");
  btn.id = "toggle-view";
  btn.textContent = "Basculer en vue joueurs";
  btn.style.marginBottom = "10px";
  btn.onclick = () => {
    if (currentView === "match") {
      currentView = "joueur";
      loadCSV(CSV_JOUEUR, renderJoueurView);
      btn.textContent = "Vue par match";
    } else {
      currentView = "match";
      loadCSV(CSV_MATCH, renderMatchView);
      btn.textContent = "Basculer en vue joueurs";
    }
  };
  return btn;
}

function renderMatchView(data) {
  container.innerHTML = "";
  container.appendChild(createToggleButton());

  const table = document.createElement("table");

  data.forEach(row => {
    if (row.length === 0 || row.every(c => c.trim() === "")) return;

    const tr = document.createElement("tr");

    // Gestion des titres fusionnés : "J01", "MATCH X", "PRONOS"
    if (row.length === 1 || (row[0] && (row[0].startsWith("J") || row[0].startsWith("MATCH") || row[0] === "PRONOS"))) {
      const td = document.createElement("td");
      td.colSpan = 10; // ajuster selon nb colonnes dans ton tableau réel
      td.textContent = row[0];

      if (row[0].startsWith("J")) td.className = "journee-header";
      else if (row[0].startsWith("MATCH")) td.className = "match-header";
      else if (row[0] === "PRONOS") td.className = "pronos-header";

      tr.appendChild(td);
      table.appendChild(tr);
      return;
    }

    row.forEach((cell, i) => {
      const td = document.createElement("td");

      // Ajout logo équipe si dans la colonne équipe domicile (0) ou extérieur (2)
      if (i === 0 || i === 2) {
        const team = cell.trim();
        if(team){
          const logo = document.createElement("img");
          logo.src = `logos/${team}.png`; // assure-toi que tes logos ont bien ce chemin et noms exacts
          logo.alt = team;
          logo.className = "team-logo";
          td.appendChild(logo);
          td.appendChild(document.createTextNode(team));
        }
      }
      else {
        // Gestion des retours à la ligne, ajout classe multiline pour CSS
        td.innerHTML = cell.replace(/\n/g, "<br>");
        td.classList.add("cell-multiline");
        // Détection missile 🎯
        if (cell.includes("🎯")) {
          td.classList.add("missile");
        }
      }

      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  container.appendChild(table);
}

function renderJoueurView(data) {
  container.innerHTML = "";
  container.appendChild(createToggleButton());

  const table = document.createElement("table");

  data.forEach(row => {
    if (row.length === 0 || row.every(c => c.trim() === "")) return;

    const tr = document.createElement("tr");

    row.forEach(cell => {
      const td = document.createElement("td");
      td.innerHTML = cell.replace(/\n/g, "<br>");
      td.classList.add("cell-multiline");
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  container.appendChild(table);
}

function loadCSV(url, callback) {
  Papa.parse(url, {
    download: true,
    complete: results => callback(results.data),
    error: () => container.innerHTML = "<p>Erreur de chargement CSV</p>"
  });
}

// Chargement initial
loadCSV(CSV_MATCH, renderMatchView);
