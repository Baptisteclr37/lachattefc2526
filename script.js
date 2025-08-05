// === LIENS CSV ===
const CSV_MATCH = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv"; // Remplace avec le bon lien
const CSV_JOUEUR = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=1528731943&single=true&output=csv";

// === DOM TARGET ===
const container = document.getElementById("table-container");
let currentView = "match"; // vue actuelle

// === CRÉATION DU BOUTON DE BASCULE ===
function createToggleButton() {
  const button = document.createElement("button");
  button.id = "toggle-view";
  button.textContent = "Basculer en vue joueurs";
  button.style.marginBottom = "15px";
  button.onclick = () => {
    if (currentView === "match") {
      currentView = "joueur";
      loadCSV(CSV_JOUEUR, renderJoueurView);
      button.textContent = "Vue par match";
    } else {
      currentView = "match";
      loadCSV(CSV_MATCH, renderMatchView);
      button.textContent = "Basculer en vue joueurs";
    }
  };
  return button;
}

// === RENDU VUE MATCH (structure existante à préserver) ===
function renderMatchView(data) {
  container.innerHTML = "";
  container.appendChild(createToggleButton());

  const table = document.createElement("table");

  let rowIndex = 0;
  while (rowIndex < data.length) {
    const row = data[rowIndex];

    // Fusion titre "Journée"
    if (row[0]?.startsWith("J")) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "journee";
      td.innerHTML = row[0];
      tr.appendChild(td);
      table.appendChild(tr);
      rowIndex++;
      continue;
    }

    // Fusion titre "MATCH X"
    if (row[0]?.startsWith("MATCH")) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "match";
      td.innerHTML = row[0];
      tr.appendChild(td);
      table.appendChild(tr);
      rowIndex++;
      continue;
    }

    // Fusion titre "PRONOS"
    if (row[0] === "PRONOS") {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "pronos";
      td.innerHTML = row[0];
      tr.appendChild(td);
      table.appendChild(tr);
      rowIndex++;
      continue;
    }

    // Ligne classique (avec logos, retours ligne, missiles)
    const tr = document.createElement("tr");
    row.forEach((cell, i) => {
      const td = document.createElement("td");

      // Logos si cellule équipe (colonne 0 ou 2)
      if (i === 0 || i === 2) {
        const logo = document.createElement("img");
        const team = cell.trim();
        logo.src = `logos/${team}.png`;
        logo.alt = team;
        logo.className = "logo";
        td.appendChild(logo);
        td.innerHTML += `<br>${team}`;
      }
      // Missiles 🎯
      else if (cell.includes("🎯")) {
        td.innerHTML = cell.replace(/\n/g, "<br>");
        td.classList.add("missile");
      }
      // Cellule normale avec retour à la ligne
      else {
        td.innerHTML = cell.replace(/\n/g, "<br>");
      }

      tr.appendChild(td);
    });
    table.appendChild(tr);
    rowIndex++;
  }

  container.appendChild(table);
}

// === RENDU VUE JOUEUR (plus simple) ===
function renderJoueurView(data) {
  container.innerHTML = "";
  container.appendChild(createToggleButton());

  const table = document.createElement("table");

  data.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.innerHTML = cell.replace(/\n/g, "<br>");
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  container.appendChild(table);
}

// === CHARGEMENT CSV ===
function loadCSV(url, callback) {
  Papa.parse(url, {
    download: true,
    complete: function (results) {
      callback(results.data);
    },
    error: function () {
      container.innerHTML = "<p>Erreur de chargement du CSV.</p>";
    },
  });
}

// === INITIALISATION ===
loadCSV(CSV_MATCH, renderMatchView);
