// === LIENS CSV ===
const CSV_MATCH = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv"; // Remplacer par ton vrai lien
const CSV_JOUEUR = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=1528731943&single=true&output=csv";

// === DOM TARGET ===
const container = document.getElementById("table-container");
let currentView = "match"; // vue actuelle
let missileData = []; // missiles 🎯

// === UTILS ===
function getLogoPath(teamName) {
  const sanitized = teamName.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `logos/${sanitized}.png`;
}

// === BOUTON DE BASCULE ===
function createToggleButton(nextMode) {
  const button = document.createElement("button");
  button.textContent = nextMode === "joueur" ? "Basculer en vue joueurs" : "Vue par match";
  button.style.marginBottom = "15px";
  button.onclick = () => {
    if (nextMode === "joueur") {
      currentView = "joueur";
      loadCSV(CSV_JOUEUR, "joueur");
    } else {
      currentView = "match";
      loadCSV(CSV_MATCH, "match");
    }
  };
  return button;
}

// === RENDU TABLEAU JOUEUR (basique) ===
function renderJoueurTable(data) {
  const table = document.createElement("table");
  data.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.innerHTML = cell.replace(/\n/g, "<br>");
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  container.innerHTML = "";
  container.appendChild(createToggleButton("match"));
  container.appendChild(table);
}

// === RENDU TABLEAU MATCH (stylisé) ===
function renderMatchTable(data) {
  container.innerHTML = "";
  container.appendChild(createToggleButton("joueur"));

  const table = document.createElement("table");
  let rowIndex = 0;

  while (rowIndex < data.length) {
    const row = data[rowIndex];

    if (row[0]?.startsWith("J")) {
      // J01 / J02
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = row.length;
      td.className = "journee-title";
      td.textContent = row[0];
      tr.appendChild(td);
      table.appendChild(tr);
      rowIndex++;
    } else if (row[0]?.startsWith("MATCH")) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = row.length;
      td.className = "match-title";
      td.textContent = row[0];
      tr.appendChild(td);
      table.appendChild(tr);
      rowIndex++;
    } else if (row[0]?.startsWith("PRONOS")) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = row.length;
      td.className = "pronos-title";
      td.textContent = row[0];
      tr.appendChild(td);
      table.appendChild(tr);
      rowIndex++;
    } else if (row.length === 3) {
      // Ligne d’équipes : logo + noms
      const tr = document.createElement("tr");

      // Colonne 1
      const td1 = document.createElement("td");
      td1.innerHTML = `<img src="${getLogoPath(row[0])}" class="logo"> ${row[0]}`;
      tr.appendChild(td1);

      // Colonne 2 (score ou résultat)
      const td2 = document.createElement("td");
      td2.innerHTML = row[1];
      tr.appendChild(td2);

      // Colonne 3
      const td3 = document.createElement("td");
      td3.innerHTML = `<img src="${getLogoPath(row[2])}" class="logo"> ${row[2]}`;
      tr.appendChild(td3);

      table.appendChild(tr);
      rowIndex++;
    } else if (row[0]?.startsWith("MISSILES")) {
      // Sauvegarder les missiles pour usage ultérieur
      missileData = row.join("\n").split("\n").map(line => {
        const parts = line.trim().split(" ");
        if (parts.length >= 4) {
          return {
            equipe1: parts[0],
            equipe2: parts[1],
            joueur: parts[2],
            prono: parts[3],
          };
        }
        return null;
      }).filter(Boolean);
      rowIndex++;
    } else {
      // Lignes normales avec joueurs + missiles 🎯
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");

        let content = cell || "";
        const missile = missileData.find(m =>
          content.includes(m.joueur) && content.includes(`(${m.prono})`)
        );
        if (missile) {
          content += " 🎯";
        }

        td.innerHTML = content.replace(/\n/g, "<br>");
        tr.appendChild(td);
      });
      table.appendChild(tr);
      rowIndex++;
    }
  }

  container.appendChild(table);
}

// === CHARGEMENT CSV VIA PAPAPARSE ===
function loadCSV(url, mode) {
  Papa.parse(url, {
    download: true,
    complete: function (results) {
      if (mode === "joueur") {
        renderJoueurTable(results.data);
      } else {
        renderMatchTable(results.data);
      }
    },
    error: function () {
      container.innerHTML = "<p>Erreur de chargement du CSV.</p>";
    },
  });
}

// === INITIALISATION ===
loadCSV(CSV_MATCH, "match");
