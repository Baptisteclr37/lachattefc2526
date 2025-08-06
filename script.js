const urlVueMatch = 'https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv';
const urlVueJoueur = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=1528731943&single=true&output=csv';

const container = document.getElementById('table-container');

// Bouton bascule
const toggleBtn = document.createElement('button');
toggleBtn.id = 'toggleViewBtn';
toggleBtn.textContent = 'Passer à la vue par joueur';
toggleBtn.style.margin = '10px';
toggleBtn.style.padding = '8px 15px';
toggleBtn.style.fontSize = '16px';
toggleBtn.style.cursor = 'pointer';
container.parentNode.insertBefore(toggleBtn, container);

let isVueMatch = true;

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
      let html = '<table border="1" cellspacing="0" cellpadding="5">';
      const joueurs = ["KMEL", "SIM", "MAT", "TIBO", "JO", "BATIST", "KRIM", "RAF", "JEREM", "JUZ", "MAX", "GERALD", "NICO"];
      let inTeamBlock = false;
      let teamBlockCounter = 0;

      data.forEach((row) => {
        html += '<tr>';
        const firstCell = row[0];

        if (firstCell === 'J01' || firstCell === 'VUE PAR JOUEUR') {
          html += '<td colspan="5" style="background-color:pink;">' + firstCell + '</td>';
          for (let i = 5; i < row.length; i++) {
            html += '<td>' + row[i] + '</td>';
          }

        } else if (firstCell === 'Equipe Dom.') {
          inTeamBlock = true;
          teamBlockCounter = 0;
          row.forEach(cell => {
            html += '<td style="background-color:pink;">' + cell + '</td>';
          });

        } else if (joueurs.includes(firstCell)) {
          html += '<td colspan="5" class="match-header">' + firstCell + '</td>';
          for (let i = 5; i < row.length; i++) {
            html += '<td>' + row[i] + '</td>';
          }

        } else {
          row.forEach((cell, colIndex) => {
            let td;

            if (inTeamBlock && teamBlockCounter < 10 && (colIndex === 0 || colIndex === 2)) {
              td = createLogoCell(cell);
              html += td.outerHTML;
            } else {
              td = document.createElement("td");

              if (cell.includes("(")) {
                const items = cell.split(")").filter(x => x.trim() !== "");
                td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
              } else if (cell.trim().split(/\s+/).length > 1) {
                td.innerHTML = cell.trim().split(/\s+/).join("<br>");
              } else {
                td.textContent = cell;
              }

              html += td.outerHTML;
            }
          });

          if (inTeamBlock && teamBlockCounter < 10) {
            teamBlockCounter++;
            if (teamBlockCounter >= 10) {
              inTeamBlock = false;
            }
          }
        }

        html += '</tr>';
      });

      html += '</table>';
      container.innerHTML = html;
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
      const table = document.createElement("table");
      let lastLineWasMatch = false;
      const matchMap = new Map();
      let skipNext = false;

      data.forEach((row, i) => {
        if (skipNext) {
          skipNext = false;
          return;
        }

        const tr = document.createElement("tr");

         if (i === 0 && row[0]) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        if (row[0]?.toUpperCase().startsWith("MATCH")) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "match-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          lastLineWasMatch = true;
          return;
        }

        if (row[0]?.toUpperCase() === "PRONOS") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "pronos-header";
          td.textContent = "PRONOS";
          tr.appendChild(td);
          table.appendChild(tr);
          lastLineWasMatch = false;
          return;
        }

        if (row[0]?.toUpperCase() === "CLASSEMENT JOURNEE") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        if (i > 0 && data[i - 1][0]?.toUpperCase() === "CLASSEMENT JOURNEE") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee";
          let classementArray = (row[0] || "").split(/\r?\n/).filter(x => x.trim());

          if (classementArray.length === 1) {
            classementArray = row[0].split(/\s{2,}/).filter(x => x.trim());
          }

          classementArray.sort((a, b) => {
            const numA = parseInt(a.trim().split(".")[0]) || 9999;
            const numB = parseInt(b.trim().split(".")[0]) || 9999;
            return numA - numB;
          });

          td.innerHTML = classementArray.join("<br>");
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        if (["MISSILES JOUES", "JACKPOT JOUES"].includes(row[0]?.toUpperCase())) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);

          if (data[i + 1]) {
            const trNext = document.createElement("tr");
            const tdNext = document.createElement("td");
            tdNext.colSpan = 3;
            tdNext.textContent = data[i + 1][0] || "";
            trNext.appendChild(tdNext);
            table.appendChild(trNext);
            skipNext = true;
          }
          return;
        }

        // ... [tout ton code de construction de ligne est inchangé ici] ...

        row.forEach((cell, index) => {
          const td = document.createElement("td");

          if (lastLineWasMatch && (index === 0 || index === 2)) {
            const teamName = cell.trim();
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
              td.textContent = cell;
            }
          } else {
            if (cell.includes("(")) {
              const items = cell.split(")").filter(x => x.trim());
              td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
            } else if (cell.trim().split(/\s+/).length > 1) {
              td.innerHTML = cell.trim().split(/\s+/).join("<br>");
            } else {
              td.textContent = cell;
            }
          }

          tr.appendChild(td);
        });

        table.appendChild(tr);

        if (data[i - 1]?.[0]?.toUpperCase() === "PRONOS") {
          const team1 = data[i - 3]?.[0]?.trim() || "";
          const team2 = data[i - 3]?.[2]?.trim() || "";
          const key = team1 + "___" + team2;
          matchMap.set(key, tr);
        }

        if (lastLineWasMatch) lastLineWasMatch = false;
      });

      // 👉 Ajout du tableau
      container.innerHTML = ''; // Efface le "Chargement des données…" avant d'afficher
      container.appendChild(table);

      // 🎯 Marquage des missiles
      function markMissiles() {
        const missilesRowIndex = data.findIndex(row => row[0]?.toUpperCase() === "MISSILES JOUES");
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

        const trs = table.querySelectorAll("tr");

        missiles.forEach(({ equipeDom, equipeExt, joueur, prono }) => {
          let foundLineIndex = -1;
          for (let i = 0; i < trs.length; i++) {
            const td = trs[i].querySelector("td");
            if (!td) continue;
            const span = td.querySelector("span");
            const text = span ? span.textContent.trim() : td.textContent.trim();
            if (text === equipeDom) {
              foundLineIndex = i;
              break;
            }
          }

          if (foundLineIndex === -1) return;

          const joueursRow = trs[foundLineIndex + 3];
          if (!joueursRow) return;

          const joueurTd = joueursRow.querySelectorAll("td")[0];
          if (!joueurTd) return;

          const currentHTML = joueurTd.innerHTML;
          const updatedHTML = currentHTML
            .split(/<br\s*\/?>/i)
            .map(line => {
              const cleanLine = line.replace(/🎯/g, "").trim();
              const nameOnly = cleanLine.replace(/\s*\(\d+ ?pts?\)/i, "").trim();
              return nameOnly === joueur ? `🎯 ${cleanLine}` : line;
            })
            .join("<br>");

          joueurTd.innerHTML = updatedHTML;
        });

        // Masquer les deux lignes affichées
        const rows = table.querySelectorAll("tr");
        let visibleIndex = 0;
        for (let i = 0; i < rows.length; i++) {
          const rowText = rows[i].textContent.toUpperCase().trim();
          if (visibleIndex === missilesRowIndex || visibleIndex === missilesRowIndex + 1) {
            rows[i].style.display = "none";
          }
          if (!rows[i].hasAttribute('data-hidden')) {
            visibleIndex++;
          }
        }
      }

      markMissiles(); // 👉 Appel juste ici
    },
    error: function(err) {
      container.textContent = 'Erreur de chargement : ' + err.message;
    }
  });


}

// Initialisation à la vue match
afficherVueMatch();

// Gestion du bouton toggle
toggleBtn.addEventListener('click', () => {
  isVueMatch = !isVueMatch;
  toggleBtn.textContent = isVueMatch ? 'Passer à la vue par joueur' : 'Passer à la vue par match';
  isVueMatch ? afficherVueMatch() : afficherVueJoueur();
});
