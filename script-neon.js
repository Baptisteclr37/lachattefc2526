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
    const logoUrl = baseImagePath + teamName.toLowerCase().replace(/\s/g, "-") + ".png";
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

        // 📅 début section 1
        if (firstCell.startsWith("📅")) {
          let td = document.createElement("td");
          td.colSpan = row.length;
          td.className = "journee-header";
          td.textContent = firstCell;
          tr.appendChild(td);
          section1Table.appendChild(tr);
          continue;
        }

        // 🥇🥈🥉 header classement
        if (firstCellUpper === HEADER_CLASSEMENT) {
          let td = document.createElement("td");
          td.colSpan = row.length;
          td.className = "classement-journee-header";
          td.textContent = firstCell;
          tr.appendChild(td);
          section1Table.appendChild(tr);

          // contenu classement
          const nextRow = data[i + 1] || [];
          let classementArray = ((nextRow[0] || "")).toString().split(/\r?\n/).filter(x => x.trim());
          if (classementArray.length === 1) {
            classementArray = (nextRow[0] || '').toString().split(/\s{2,}/).filter(x => x.trim());
          }
          classementArray.sort((a, b) => {
            const aTrim = (a || '').trim();
            const bTrim = (b || '').trim();
            const numA = parseInt((aTrim.split(".")[0] || "").replace(/[^\d]/g, ""), 10);
            const numB = parseInt((bTrim.split(".")[0] || "").replace(/[^\d]/g, ""), 10);
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

        // autres lignes
        otherRows.push(row);
      }

      // Construction des cards
      let cardsFragment = document.createDocumentFragment();
      for (let i = 0; i < otherRows.length; i++) {
        const row = otherRows[i];
        const firstCell = (row[0] || '').toString().trim();

        if (joueurs.includes(firstCell)) {
          let cardTable = document.createElement("table");
          cardTable.classList.add("card");

          // match-header
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

          // ligne juste après match-header = pronos-header (pas de logos)
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

          // ajouter les 10 lignes suivantes (lignes de match avec logos)
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
                } else if ((cell || '').trim().split(/\s+/).length > 1) {
                  td.innerHTML = (cell || '').trim().split(/\s+/).join("<br>");
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
  container.innerHTML = ''; // nettoie le conteneur AVANT d’afficher “chargement”
  container.textContent = 'Chargement des données…';

  Papa.parse(urlVueMatch, {
    download: true,
    complete: function(results) {
      const data = results.data;

      // 👉 On va maintenant créer 2 tables :
      //    - section1Table : de journee-header (📅) jusqu'à la ligne "classement-journee" incluse
      //    - table (post) : le reste (missiles, jackpots, etc.)
      const section1Table = document.createElement("table");
      section1Table.classList.add("card");

      const table = document.createElement("table");
      table.classList.add("card");

      let inSection1 = false;                 // on est dans la 1ère section ?
      let waitingClassementContent = false;   // juste après le header classement, on attend la ligne contenu
      let lastLineWasMatch = false;           // même logique d'origine pour les logos
      const matchMap = new Map();
      let skipNext = false;

      const HEADER_CLASSEMENT = "🥇🥈🥉 CLASSEMENT JOURNEE";

      data.forEach((row, i) => {
        if (skipNext) { skipNext = false; return; }

        const currentTable = inSection1 ? section1Table : table;
        const tr = document.createElement("tr");

        // Ne pas afficher la ligne "MATCH X"
        if ((row[0] || '').toUpperCase().startsWith("MATCH")) {
          lastLineWasMatch = true; // garder logos pour la ligne suivante
          return; // on n'insère pas la ligne
        }

        // 📅 Début de section 1
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

        // PRONOS (même comportement, on route vers la table courante)
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

        // Header Classement Journée
        if ((row[0] || '').toUpperCase() === HEADER_CLASSEMENT) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          (inSection1 ? section1Table : table).appendChild(tr);
          if (inSection1) waitingClassementContent = true; // la prochaine ligne (contenu) reste dans section1
          return;
        }

        // Ligne de contenu du classement (juste après le header)
        if (i > 0 && (data[i - 1][0] || '').toUpperCase() === HEADER_CLASSEMENT) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee";
          let classementArray = ((row[0] || "")).split(/\r?\n/).filter(x => x.trim());
          if (classementArray.length === 1) {
            classementArray = (row[0] || '').split(/\s{2,}/).filter(x => x.trim());
          }
          classementArray.sort((a, b) => {
            const numA = parseInt(a.trim().split(".")[0]) || 9999;
            const numB = parseInt(b.trim().split(".")[0]) || 9999;
            return numA - numB;
          });
          td.innerHTML = classementArray.join("<br>");
          tr.appendChild(td);

          // Ajoute cette ligne de contenu à la bonne table
          (waitingClassementContent && inSection1 ? section1Table : table).appendChild(tr);

          // Si on était en attente, on clôt la section 1 après cette ligne
          if (waitingClassementContent && inSection1) {
            waitingClassementContent = false;
            inSection1 = false; // fin de la section 1
          }
          return;
        }

        // Blocs spéciaux (missiles, jackpot, double) — vont dans la table courante
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

        // Rendu des autres lignes (logos, textes, pronos)
        row.forEach((cell, index) => {
          const td = document.createElement("td");

          if (lastLineWasMatch && (index === 0 || index === 2)) {
            const teamName = (cell || '').trim();
            if (teamName) {
              const logoUrl = baseImagePath + teamName.toLowerCase().replace(/\s/g, "-") + ".png";
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
            } else if ((cell || '').trim().split(/\s+/).length > 1) {
              td.innerHTML = (cell || '').trim().split(/\s+/).join("<br>");
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

      // 👉 Ajout des 2 tables (section1 puis le reste)
      container.innerHTML = '';
      container.appendChild(section1Table);
      container.appendChild(table);

   
  // 🎨 Mise en forme spéciale pour le tableau du match à scorer (le dernier tableau .card)
const allCards = container.querySelectorAll("table.card");
if (allCards.length > 0) {
  const scorerCard = allCards[allCards.length - 1]; // dernier tableau affiché
  const rows = scorerCard.querySelectorAll("tr");

  // On saute la 1ère ligne (header) et on traite les 14 suivantes
  for (let i = 1; i <= 14 && i < rows.length; i++) {
    const row = rows[i];
    const cells = row.querySelectorAll("td");
    const middleCell = cells[Math.floor(cells.length / 2)];

    if (middleCell) {
      const text = middleCell.textContent.trim();
      const match = text.match(/(\d+)\s*pt?s?/i); // accepte "1pts", "1 pt", "1pt"...

      if (match) {
        const points = parseInt(match[1], 10);

        // Reset éventuel
        row.style.background = '';
        row.style.backgroundColor = '';

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
            // 0pts → pas de couleur
            break;
        }
      }
    }
  }
}

      // Mise en surbrillance des bons pronos (logique existante)
      const rows = document.querySelectorAll("table tr");
      rows.forEach((tr, i) => {
        const firstCell = tr.cells[0]?.textContent.trim();
        if (/^MATCH\s[1-9]$/.test(firstCell || '')) {
          const resultRow = rows[i + 1];
          const resultCell = resultRow?.cells[1];
          if (!resultCell) return;

          const resultValue = resultCell.textContent.trim();
          if (!["1", "N", "2"].includes(resultValue)) return;

          const pronosRow = rows[i + 3];
          if (!pronosRow) return;

          for (let c = 0; c < 3; c++) {
            if (pronosRow.cells[c]?.textContent.trim() === resultValue) {
              pronosRow.cells[c].style.backgroundColor = "#31823c"; // vert doux
            }
          }
        }
      });

     function createLogoSectionsFor(tableToSplit) {
  const rows = Array.from(tableToSplit.querySelectorAll('tr'));
  const newTables = [];
  const used = new Set();
  let count = 0;

  for (let i = 0; i < rows.length && count < 9; i++) {
    if (used.has(i)) continue;
    const hasLogo = rows[i].querySelector('img.team-logo') !== null;
    if (hasLogo) {
      const t = document.createElement('table');
      t.classList.add('card');
      for (let j = 0; j < 4; j++) {
        const idx = i + j;
        if (idx < rows.length) {
          t.appendChild(rows[idx].cloneNode(true));
          used.add(idx);
        }
      }
      newTables.push(t);
      count++;
    }
  }

  // le “reste” dans une dernière table
  const remaining = document.createElement('table');
  remaining.classList.add('card');
  rows.forEach((r, idx) => {
    if (!used.has(idx)) remaining.appendChild(r.cloneNode(true));
  });
  newTables.push(remaining);

  // on remplace *uniquement* la table source, on ne touche pas à la 1re section
  const frag = document.createDocumentFragment();
  newTables.forEach(t => frag.appendChild(t));
  tableToSplit.replaceWith(frag);
}


      // 🎯 Marquage des missiles
      function markMissiles() {
        const missilesRowIndex = data.findIndex(row => (row[0] || '').toUpperCase() === "MISSILES JOUES");
        if (missilesRowIndex === -1) return;

        const missilesText = data[missilesRowIndex + 1]?.[0];
        if (!missilesText) return;

        const missiles = missilesText.split(/\r?\n/).filter(x => x.trim()).map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length < 4) return null;
          return {
            equipeDom: parts[0],
            equipeExt: parts[1],
            joueur: parts[2],
            prono: parts[3],
          };
        }).filter(Boolean);

        const trs = container.querySelectorAll("tr"); // ▶️ cherche sur toutes les tables

        missiles.forEach(({ equipeDom, equipeExt, joueur, prono }) => {
          let foundLineIndex = -1;
          for (let i = 0; i < trs.length; i++) {
            const td = trs[i].querySelector("td");
            if (!td) continue;
            const span = td.querySelector("span");
            const text = span ? span.textContent.trim() : td.textContent.trim();
            if (text === equipeDom) { foundLineIndex = i; break; }
          }
          if (foundLineIndex === -1) return;

          const joueursRow = trs[foundLineIndex + 3];
          if (!joueursRow) return;

          const joueurTd = joueursRow.querySelectorAll("td")[0];
          if (!joueurTd) return;

          const currentHTML = joueurTd.innerHTML;
          const updatedHTML = currentHTML
            .split(/<br\s*\/?>/i)
            .join("<br>")
            .split("<br>")
            .map(line => {
              const cleanLine = line.replace(/🎯/g, "").trim();
              const nameOnly = cleanLine.replace(/\s*\(\d+ ?pts?\)/i, "").trim();
              return nameOnly === joueur ? `🎯 ${line.trim()}` : line;
            })
            .join("<br>");

          joueurTd.innerHTML = updatedHTML;
        });

        // 🔻 Masquer la ligne titre et la suivante (contenu) pour MISSILES
        const allTrs = Array.from(container.querySelectorAll('tr'));
        for (let i = 0; i < allTrs.length; i++) {
          const txt = allTrs[i].textContent.trim().toUpperCase();
          if (txt === 'MISSILES JOUES') {
            allTrs[i].style.display = 'none';
            if (allTrs[i + 1]) allTrs[i + 1].style.display = 'none';
            break;
          }
        }
      }

      // 🎰 Marquage des jackpots
      function markJackpots() {
        const jackpotRowIndex = data.findIndex(row => (row[0] || '').toUpperCase() === "JACKPOT JOUES");
        if (jackpotRowIndex === -1) return;

        const jackpotText = data[jackpotRowIndex + 1]?.[0];
        if (!jackpotText) return;

        const jackpots = jackpotText.split(/\r?\n/).filter(x => x.trim()).map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length < 4) return null;
          return {
            equipeDom: parts[0],
            equipeExt: parts[1],
            joueur: parts[2],
            prono: parts[3],
          };
        }).filter(Boolean);

        const trs = container.querySelectorAll("tr"); // ▶️ toutes tables

        jackpots.forEach(({ equipeDom, equipeExt, joueur, prono }) => {
          let foundLineIndex = -1;
          for (let i = 0; i < trs.length; i++) {
            const td = trs[i].querySelector("td");
            if (!td) continue;
            const hasLogo = td.querySelector("img");
            const text = td.textContent.trim();
            if (hasLogo && text === equipeDom) { foundLineIndex = i; break; }
          }
          if (foundLineIndex === -1) return;

          const joueursRow = trs[foundLineIndex + 3];
          if (!joueursRow) return;

          const joueurTds = joueursRow.querySelectorAll("td");
          if (!joueurTds.length) return;

          joueurTds.forEach(td => {
            const currentHTML = td.innerHTML;
            const updatedHTMLJackpot = currentHTML
              .split(/<br\s*\/?>/i)
              .join("<br>")
              .split("<br>")
              .map(line => {
                const cleanLine = line.trim();
                const nameOnly = cleanLine.replace(/\s*\(.*?\)/, "").replace(/🎯|🎰/g, "").trim();
                if (nameOnly === joueur) {
                  if (line.includes("🎯")) return line.replace("🎯", "🎰🎯");
                  if (!line.includes("🎰")) return `🎰 ${line}`;
                }
                return line;
              })
              .join("<br>");
            td.innerHTML = updatedHTMLJackpot; // ← fix
          });
        });

        // 🔻 Masquer titre + contenu JACKPOT
        const allTrs = Array.from(container.querySelectorAll('tr'));
        for (let i = 0; i < allTrs.length; i++) {
          const txt = allTrs[i].textContent.trim().toUpperCase();
          if (txt === 'JACKPOT JOUES') {
            allTrs[i].style.display = 'none';
            if (allTrs[i + 1]) allTrs[i + 1].style.display = 'none';
            break;
          }
        }
      }

      // 2️⃣ Marquage des Double chance
      function markDouble() {
        const DoubleRowIndex = data.findIndex(row => (row[0] || '').toUpperCase() === "DOUBLE CHANCE JOUES");
        if (DoubleRowIndex === -1) return;

        const DoubleText = data[DoubleRowIndex + 1]?.[0];
        if (!DoubleText) return;

        const Double = DoubleText.split(/\r?\n/).filter(x => x.trim()).map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length < 4) return null;
          return {
            equipeDom: parts[0],
            equipeExt: parts[1],
            joueur: parts[2],
            prono: parts[3],
          };
        }).filter(Boolean);

        const trs = container.querySelectorAll("tr"); // ▶️ toutes tables

        Double.forEach(({ equipeDom, equipeExt, joueur, prono }) => {
          let foundLineIndex = -1;
          for (let i = 0; i < trs.length; i++) {
            const td = trs[i].querySelector("td");
            if (!td) continue;
            const hasLogo = td.querySelector("img");
            const text = td.textContent.trim();
            if (hasLogo && text === equipeDom) { foundLineIndex = i; break; }
          }
          if (foundLineIndex === -1) return;

          const joueursRow = trs[foundLineIndex + 3];
          if (!joueursRow) return;

          const joueurTds = joueursRow.querySelectorAll("td");
          if (!joueurTds.length) return;

          joueurTds.forEach(td => {
            const currentHTML = td.innerHTML;
            const updatedHTMLDouble = currentHTML
              .split(/<br\s*\/?>/i)
              .join("<br>")
              .split("<br>")
              .map(line => {
                const cleanLine = line.trim();
                const nameOnly = cleanLine.replace(/\s*\(.*?\)/, "").replace(/2️⃣|🎯|🎰/g, "").trim();
                if (nameOnly === joueur) {
                  if (line.includes("🎯")) return line.replace("🎯", "2️⃣🎯");
                  if (line.includes("🎰🎯")) return line.replace("🎰🎯", "2️⃣🎰🎯");
                  if (line.includes("🎰")) return line.replace("🎰", "2️⃣🎰");
                  if (!line.includes("2️⃣")) return `2️⃣ ${line}`;
                }
                return line;
              })
              .join("<br>");
            td.innerHTML = updatedHTMLDouble; // ← fix
          });
        });

        // 🔻 Masquer titre + contenu DOUBLE CHANCE
        const allTrs = Array.from(container.querySelectorAll('tr'));
        for (let i = 0; i < allTrs.length; i++) {
          const txt = allTrs[i].textContent.trim().toUpperCase();
          if (txt === 'DOUBLE CHANCE JOUES') {
            allTrs[i].style.display = 'none';
            if (allTrs[i + 1]) allTrs[i + 1].style.display = 'none';
            break;
          }
        }
      }

      // Marquage de la fonction surprise (inchangé)
      function markSurpriseLines() {
        const lignes = Array.from(document.querySelectorAll("tr"));

        lignes.forEach((ligne, index) => {
          if (!ligne.textContent.toUpperCase().includes("PRONOS")) return;

          const ligneJoueurs = lignes[index + 2];
          if (!ligneJoueurs) return;

          const cellules = Array.from(ligneJoueurs.querySelectorAll("td"));
          if (cellules.length < 3) return;

          const nbJoueursParCellule = cellules.map((cellule) => {
            const brut = cellule.innerHTML;
            const contenu = brut
              .replace(/<br\s*\/?>/ig, '<br>')
              .split('<br>')
              .map(l => l.trim())
              .filter(l => l !== "" && l !== "#N/A");
            return contenu.length;
          });

          const totalJoueurs = nbJoueursParCellule.reduce((a, b) => a + b, 0);
          if (totalJoueurs === 0) return;

          cellules.forEach((cellule, colIndex) => {
            const nbJoueursCellule = nbJoueursParCellule[colIndex];
            const ratio = nbJoueursCellule / totalJoueurs;
            if (nbJoueursCellule > 0 && ratio <= 0.25) {
              if (!cellule.innerHTML.includes("🕵🏻‍♂️SURPRIZ?")) {
                cellule.innerHTML = `<strong>🕵🏻‍♂️SURPRIZ?</strong><br><br>${cellule.innerHTML}`;
              }
            }
          });
        });
      }

      // Appels
      markMissiles();
      markJackpots();
      markDouble();
      markSurpriseLines();
      createLogoSectionsFor(table);

       // 🌸 Mise en évidence des bons résultats (dégradé rose/violet)
      function highlightResults() {
        const cards = document.querySelectorAll("#table-container table.card");
        // on limite aux 9 premières cards (les matchs)
        cards.forEach((card, idx) => {
          if (idx >= 10) return;
          const rows = card.querySelectorAll("tr");
          if (rows.length < 3) return;

          const targetValue = rows[0].cells[1]?.textContent.trim(); // valeur du milieu première ligne
          if (!targetValue || !["A VENIR", "1", "N", "2"].includes(targetValue)) return;

          const checkRow = rows[2]; // 2 lignes plus bas
          if (!checkRow) return;

          for (let c = 0; c <= 2; c++) {
            const cell = checkRow.cells[c];
            if (cell && cell.textContent.trim() === targetValue) {
              // Applique le dégradé
              cell.style.background = "linear-gradient(to left, #ff00cc, #3333ff)";
              cell.style.color = "#fff";
              // Cellule juste en dessous
              const below = rows[3]?.cells[c];
              if (below) {
                below.style.background = "linear-gradient(to left, #ff00cc, #3333ff)";
                below.style.color = "#fff";
              }
            }
          }
        });
      }

      // appel
      highlightResults();
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
