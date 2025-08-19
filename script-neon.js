const urlVueMatch = 'https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv';
const urlVueJoueur = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=1528731943&single=true&output=csv';

// =====================
// Création du bandeau fixe
// =====================
const headerBar = document.createElement('div');
headerBar.id = 'headerBar';

// Bouton refresh
const refreshBtn = document.createElement('button');
refreshBtn.id = 'refreshBtn';
refreshBtn.textContent = '🔄 Refresh';

// Bouton bascule vue
const toggleBtn = document.createElement('button');
toggleBtn.id = 'toggleViewBtn';
toggleBtn.textContent = 'Vue par joueur';

// Ajout dans le bandeau
headerBar.appendChild(refreshBtn);
headerBar.appendChild(toggleBtn);

// Ajout du bandeau au-dessus de tout
document.body.insertBefore(headerBar, document.body.firstChild);
const container = document.getElementById('table-container');

// =====================
// Variables globales
// =====================
let isVueMatch = true;
// =====================
// Fonctions utilitaires
// =====================
function getUrlWithTimestamp(baseUrl) {
    return baseUrl + "&t=" + new Date().getTime();
}

// =====================
// Rafraîchissement
// =====================
function refreshData() {
    if (isVueMatch) afficherVueMatch();
    else afficherVueJoueur();
}

// =====================
// Gestion des boutons
// =====================
refreshBtn.addEventListener('click', refreshData);
toggleBtn.addEventListener('click', () => {
    isVueMatch = !isVueMatch;
    toggleBtn.textContent = isVueMatch ? 'Vue par joueur' : 'Vue par match';
    refreshData();
});

const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

function createLogoCell(content) {
  const td = document.createElement("td");
  const teamName = content.trim();

  if (teamName) {
    const logoUrl = baseImagePath + teamName.toLowerCase().replace(/\\s/g, "-") + ".png";
    const img = document.createElement("img");
    img.src = logoUrl;
    img.alt = teamName + " logo";
    img.className = "team-logo";

    td.style.textAlign = "center";
    td.appendChild(img);
    td.appendChild(document.createElement("br"));
    td.appendChild(document.createTextNode(teamName));
  } else {
    td.textContent = content;
  }

  return td;
}

function afficherVueJoueur() {
  container.innerHTML = '';
  container.textContent = 'Chargement des données…';

  Papa.parse(urlVueJoueur, {
    download: true,
    header: false,
    complete: function(results) {
      const data = results.data;
      const joueurs = ["KMEL", "SIM", "MAT", "TIBO", "JO", "BATIST", "KRIM", "RAF", "JEREM", "JUZ", "MAX", "GERALD", "NICO", "THOMAS"];
      const HEADER_CLASSEMENT = "🥇🥈🥉 CLASSEMENT JOURNEE";

      let section1Table = document.createElement("table");
      section1Table.classList.add("card");

      let otherRows = [];
      let skipNext = false;

      for (let i = 0; i < data.length; i++) {
        if (skipNext) { skipNext = false; continue; }
        const row = data[i];
        if (!row) continue;
        const firstCell = (row[0] || '').toString().trim();
        const firstCellUpper = firstCell.toUpperCase();
        const tr = document.createElement("tr");

        if (firstCell.startsWith("📅")) {
          let td = document.createElement("td");
          td.colSpan = row.length;
          td.className = "journee-header";
          td.textContent = firstCell;
          tr.appendChild(td);
          section1Table.appendChild(tr);
          continue;
        }

        if (firstCellUpper === HEADER_CLASSEMENT) {
          let td = document.createElement("td");
          td.colSpan = row.length;
          td.className = "classement-journee-header";
          td.textContent = firstCell;
          tr.appendChild(td);
          section1Table.appendChild(tr);

          const nextRow = data[i + 1] || [];
          let classementArray = ((nextRow[0] || "")).toString().split(/\\r?\\n/).filter(x => x.trim());
          if (classementArray.length === 1) {
            classementArray = (nextRow[0] || '').toString().split(/\\s{2,}/).filter(x => x.trim());
          }
          classementArray.sort((a, b) => {
            const aTrim = (a || '').trim();
            const bTrim = (b || '').trim();
            const numA = parseInt((aTrim.split(".")[0] || "").replace(/[^\\d]/g, ""), 10);
            const numB = parseInt((bTrim.split(".")[0] || "").replace(/[^\\d]/g, ""), 10);
            if (!isNaN(numA) && !isNaN(numB)) {
              if (numA !== numB) return numA - numB;
              return aTrim.localeCompare(bTrim, undefined, {sensitivity: 'base'});
            }
            if (!isNaN(numA)) return -1;
            if (!isNaN(numB)) return 1;
            return aTrim.localeCompare(bTrim, undefined, {sensitivity: 'base'});
          });
          let tdContent = document.createElement("td");
          tdContent.colSpan = row.length;
          tdContent.className = "classement-journee";
          tdContent.innerHTML = classementArray.join("<br>");
          let trContent = document.createElement("tr");
          trContent.appendChild(tdContent);
          section1Table.appendChild(trContent);

          skipNext = true;
          continue;
        }

        otherRows.push(row);
      }

      let cardsFragment = document.createDocumentFragment();
      for (let i = 0; i < otherRows.length; i++) {
        const row = otherRows[i];
        const firstCell = (row[0] || '').toString().trim();

        if (joueurs.includes(firstCell)) {
          let cardTable = document.createElement("table");
          cardTable.classList.add("card");

          let trHeader = document.createElement("tr");
          let tdHeader = document.createElement("td");
          tdHeader.colSpan = 5;
          tdHeader.className = "match-header";
          tdHeader.textContent = firstCell;
          trHeader.appendChild(tdHeader);
          for (let k = 5; k < row.length; k++) {
            let td = document.createElement("td");
            td.textContent = row[k];
            trHeader.appendChild(td);
          }
          cardTable.appendChild(trHeader);

          if (i + 1 < otherRows.length) {
            let trPronos = document.createElement("tr");
            otherRows[i + 1].forEach(cell => {
              let td = document.createElement("td");
              td.className = "pronos-header";
              td.textContent = cell || '';
              trPronos.appendChild(td);
            });
            cardTable.appendChild(trPronos);
          }

          for (let j = 2; j <= 11 && (i + j) < otherRows.length; j++) {
            let tr = document.createElement("tr");
            otherRows[i + j].forEach((cell, colIndex) => {
              let td;
              if (colIndex === 0 || colIndex === 2) {
                td = createLogoCell(cell);
              } else {
                td = document.createElement("td");
                if ((cell || '').includes("(")) {
                  const items = (cell || '').split(")").filter(x => x.trim() !== "");
                  td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
                } else if ((cell || '').trim().split(/\\s+/).length > 1) {
                  td.innerHTML = (cell || '').trim().split(/\\s+/).join("<br>");
                } else {
                  td.textContent = cell || '';
                }
              }
              tr.appendChild(td);
            });
            cardTable.appendChild(tr);
          }

          cardsFragment.appendChild(cardTable);
          i += 11;
        }
      }

      container.innerHTML = '';
      container.appendChild(section1Table);
      container.appendChild(cardsFragment);
    },
    error: function(err) {
      container.textContent = 'Erreur de chargement : ' + err.message;
    }
  });
}

function afficherVueMatch() {
  container.innerHTML = '';
  container.textContent = 'Chargement des données…';

  Papa.parse(urlVueMatch, {
    download: true,
    complete: function(results) {
      const data = results.data;
      const section1Table = document.createElement("table");
      section1Table.classList.add("card");

      const table = document.createElement("table");
      table.classList.add("card");

      let inSection1 = false;
      let waitingClassementContent = false;
      let lastLineWasMatch = false;
      const matchMap = new Map();
      let skipNext = false;

      const HEADER_CLASSEMENT = "🥇🥈🥉 CLASSEMENT JOURNEE";

      data.forEach((row, i) => {
        if (skipNext) { skipNext = false; return; }
        const currentTable = inSection1 ? section1Table : table;
        const tr = document.createElement("tr");

        if ((row[0] || '').toUpperCase().startsWith("MATCH")) {
          lastLineWasMatch = true;
          return;
        }

        if ((row[0] || '').toUpperCase().startsWith("📅")) {
          inSection1 = true;
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          section1Table.appendChild(tr);
          lastLineWasMatch = true;
          return;
        }

        if ((row[0] || '').toUpperCase() === "PRONOS") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "pronos-header";
          td.textContent = "PRONOS";
          tr.appendChild(td);
          currentTable.appendChild(tr);
          lastLineWasMatch = false;
          return;
        }

        if ((row[0] || '').toUpperCase() === HEADER_CLASSEMENT) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          (inSection1 ? section1Table : table).appendChild(tr);
          if (inSection1) waitingClassementContent = true;
          return;
        }

        if (i > 0 && (data[i - 1][0] || '').toUpperCase() === HEADER_CLASSEMENT) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee";
          let classementArray = ((row[0] || "")).split(/\\r?\\n/).filter(x => x.trim());
          if (classementArray.length === 1) {
            classementArray = (row[0] || '').split(/\\s{2,}/).filter(x => x.trim());
          }
          classementArray.sort((a, b) => {
            const numA = parseInt(a.trim().split(".")[0]) || 9999;
            const numB = parseInt(b.trim().split(".")[0]) || 9999;
            return numA - numB;
          });
          td.innerHTML = classementArray.join("<br>");
          tr.appendChild(td);
          (waitingClassementContent && inSection1 ? section1Table : table).appendChild(tr);
          if (waitingClassementContent && inSection1) {
            waitingClassementContent = false;
            inSection1 = false;
          }
          return;
        }

        if (["MISSILES JOUES", "JACKPOT JOUES", "DOUBLE CHANCE JOUES"].includes((row[0] || '').toUpperCase())) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.textContent = row[0];
          tr.appendChild(td);
          currentTable.appendChild(tr);

          if (data[i + 1]) {
            const trNext = document.createElement("tr");
            const tdNext = document.createElement("td");
            tdNext.colSpan = 3;
            tdNext.textContent = data[i + 1][0] || "";
            trNext.appendChild(tdNext);
            currentTable.appendChild(trNext);
            skipNext = true;
          }
          return;
        }

        row.forEach((cell, index) => {
          const td = document.createElement("td");
          if (lastLineWasMatch && (index === 0 || index === 2)) {
            const teamName = (cell || '').trim();
            if (teamName) {
              const logoUrl = baseImagePath + teamName.toLowerCase().replace(/\\s/g, "-") + ".png";
              const img = document.createElement("img");
              img.src = logoUrl;
              img.alt = teamName + " logo";
              img.className = "team-logo";
              td.appendChild(img);
              const span = document.createElement("span");
              span.textContent = " " + teamName;
              td.appendChild(span);
            } else {
              td.textContent = cell || '';
            }
          } else {
            if ((cell || '').includes("(")) {
              const items = (cell || '').split(")").filter(x => x.trim());
              td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
            } else if ((cell || '').trim().split(/\\s+/).length > 1) {
              td.innerHTML = (cell || '').trim().split(/\\s+/).join("<br>");
            } else {
              td.textContent = cell || '';
            }
          }
          tr.appendChild(td);
        });

        currentTable.appendChild(tr);
        if (data[i - 1]?.[0]?.toUpperCase() === "PRONOS") {
          const team1 = (data[i - 3]?.[0] || '').trim();
          const team2 = (data[i - 3]?.[2] || '').trim();
          const key = team1 + "___" + team2;
          matchMap.set(key, tr);
        }

        if (lastLineWasMatch) lastLineWasMatch = false;
      });

      container.innerHTML = '';
      container.appendChild(section1Table);
      container.appendChild(table);

      // 🎨 Mise en forme spéciale pour la 10ème card
      const cards = container.querySelectorAll("table.card");
      if (cards.length >= 10) {
        const rows10 = cards[9].querySelectorAll("tr");
        for (let i = 1; i <= 14 && i < rows10.length; i++) {
          const row = rows10[i];
          const cells = row.querySelectorAll("td");
          const middleCell = cells[Math.floor(cells.length / 2)];

          if (middleCell) {
            const text = middleCell.textContent.trim();
            const match = text.match(/(\\d+)pts/);

            if (match) {
              const points = parseInt(match[1], 10);
              switch (points) {
                case 1:
                  row.style.backgroundColor = "pink";
                  break;
                case 2:
                  row.style.backgroundColor = "violet";
                  break;
                case 3:
                  row.style.background = "linear-gradient(to right, #ff9a9e, #fad0c4)";
                  break;
                default:
                  break; // 0pts → pas de couleur
              }
            }
          }
        }
      }
    },
    error: function(err) {
      container.textContent = 'Erreur de chargement : ' + err.message;
    }
  });
}

// Initialisation à la vue match
afficherVueMatch();

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        headerBar.classList.add('scrolled');
    } else {
        headerBar.classList.remove('scrolled');
    }
});
