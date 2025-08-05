let vueActive = 'match'; // Valeur par défaut
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

// LOGOS POUR AFFICHAGE JOUEUR
const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/"; // Chemin vers ton dossier contenant les logos
function createLogoCell(content) {
  const td = document.createElement("td");
  const teamName = content.trim();

  if (teamName) {
    const logoUrl = baseImagePath + teamName.toLowerCase().replace(/\s/g, "-") + ".png";
    const img = document.createElement("img");
    img.src = logoUrl;
    img.alt = teamName + " logo";
    img.className = "team-logo";

    td.style.textAlign = "center"; // Centrage du contenu
    td.appendChild(img);
    td.appendChild(document.createElement("br")); // Saut de ligne
    td.appendChild(document.createTextNode(teamName));
  } else {
    td.textContent = content;
  }

  return td;
}



function afficherVueJoueur() {
  vueActive = 'joueur'; // On bascule la vue
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

      data.forEach((row, rowIndex) => {
        html += '<tr>';
        const firstCell = row[0];

        if (firstCell === 'J01') {
          html += '<td colspan="5" style="background-color:pink;">' + firstCell + '</td>';
          for (let i = 5; i < row.length; i++) {
            html += '<td>' + row[i] + '</td>';
          }

        } else if (firstCell === 'VUE PAR JOUEUR') {
          html += '<td colspan="5">' + firstCell + '</td>';
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
          // Lignes normales, dont les 10 lignes après "Equipe Dom." avec logos
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
                const noms = cell.trim().split(/\s+/);
                td.innerHTML = noms.map(n => n).join("<br>");
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




// Fonction affichage vue match (ton gros code perso)
function afficherVueMatch() {
   if (vueActive !== 'match') return; // Empêche de charger si on est en vue joueur
  container.textContent = 'Chargement des données…';

  const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

  Papa.parse(urlVueMatch, {
    download: true,
    complete: function(results) {
      const data = results.data;
      container.textContent = ""; // Clear container

      const table = document.createElement("table");
      // ... (copie ici ton gros code de construction du tableau personnalisé, 
      // y compris la gestion des logos, fusions, missiles, etc.)

      // Par exemple, coller ici ton code depuis "Papa.parse(url, { ..."

      // À la fin:
      container.appendChild(table);

      // Appelle ta fonction markMissiles() ici, etc.

    },
    error: function(err) {
      container.textContent = 'Erreur de chargement : ' + err.message;
    }
  });
}

// Initialisation vue match
afficherVueMatch();

// Gestion clic bouton bascule
toggleBtn.addEventListener('click', () => {
  isVueMatch = !isVueMatch;
  if (isVueMatch) {
    toggleBtn.textContent = 'Passer à la vue par joueur';
    afficherVueMatch();
  } else {
    toggleBtn.textContent = 'Passer à la vue par match';
    afficherVueJoueur();
  }
});


document.addEventListener("DOMContentLoaded", () => {
  



  const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");

      let lastLineWasMatch = false;
      const matchMap = new Map(); // Pour retrouver les lignes de pronos par match

      let skipNext = false; // pour sauter la ligne fusionnée après MISSILES JOUES

      data.forEach((row, i) => {
        if (skipNext) {
          skipNext = false;
          return; // on saute cette ligne pour éviter double affichage
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

        if (row[0] && row[0].toUpperCase().startsWith("MATCH")) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "match-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);

          lastLineWasMatch = true;
          return;
        }

        if (row[0] && row[0].toUpperCase() === "PRONOS") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "pronos-header";
          td.textContent = "PRONOS";
          tr.appendChild(td);
          table.appendChild(tr);

          lastLineWasMatch = false;
          return;
        }

        if (row[0] && row[0].toUpperCase() === "CLASSEMENT JOURNEE") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        if (i > 0 && data[i - 1][0] && data[i - 1][0].toUpperCase() === "CLASSEMENT JOURNEE") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee";

          let classementArray = (row[0] || "").split(/\r?\n/).filter(x => x.trim() !== "");
          if (classementArray.length === 1) {
            classementArray = row[0].split(/\s{2,}/).filter(x => x.trim() !== "");
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

        // Fusion des lignes MISSILES JOUES + suivante sur 3 colonnes
        if (row[0] && row[0].toUpperCase() === "MISSILES JOUES") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);

          // Ligne suivante fusionnée
          if (data[i + 1]) {
            const trNext = document.createElement("tr");
            const tdNext = document.createElement("td");
            tdNext.colSpan = 3;
            tdNext.textContent = data[i + 1][0] || "";
            trNext.appendChild(tdNext);
            table.appendChild(trNext);
            skipNext = true; // ignorer la ligne suivante dans la boucle principale
          }
          return;
        }

        // Ligne avec logos après MATCH
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
              const items = cell.split(")").filter(x => x.trim() !== "");
              td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
            } else if (cell.trim().split(/\s+/).length > 1) {
              const noms = cell.trim().split(/\s+/);
              td.innerHTML = noms.map(n => n).join("<br>");
            } else {
              td.textContent = cell;
            }
          }

          tr.appendChild(td);
        });

        table.appendChild(tr);

        // Sauvegarde de ligne de pronostics après PRONOS
        if (data[i - 1] && data[i - 1][0] && data[i - 1][0].toUpperCase() === "PRONOS") {
          const team1 = data[i - 3]?.[0]?.trim() || "";
          const team2 = data[i - 3]?.[2]?.trim() || "";
          const key = team1 + "___" + team2;
          matchMap.set(key, tr);
        }

        if (lastLineWasMatch) lastLineWasMatch = false;
      });

      // Fonction corrigée pour marquer les missiles
      function markMissiles() {
  const missilesRowIndex = data.findIndex(row => row[0] && row[0].toUpperCase() === "MISSILES JOUES");
  if (missilesRowIndex === -1) return;

  const missilesText = data[missilesRowIndex + 1]?.[0];
  if (!missilesText) return;

  const missiles = missilesText.split(/\r?\n/).filter(x => x.trim() !== "").map(line => {
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
    console.log(`Missile trouvé : ${equipeDom} vs ${equipeExt} joueur=${joueur} prono=${prono}`);

    // Trouver la ligne du match
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

    if (foundLineIndex === -1) {
      console.warn(`Match ${equipeDom} vs ${equipeExt} non trouvé`);
      return;
    }

    // Chercher 3 lignes plus bas → noms des joueurs par prono
    const joueursRow = trs[foundLineIndex + 3];
    if (!joueursRow) {
      console.warn(`Ligne joueurs non trouvée pour ${equipeDom}`);
      return;
    }

    const joueurTd = joueursRow.querySelectorAll("td")[0]; // Colonne 1 uniquement
    if (!joueurTd) return;

    const currentHTML = joueurTd.innerHTML;
    const updatedHTML = currentHTML
      .split(/<br\s*\/?>/i)
      .map(line => {
        const cleanLine = line.replace(/🎯/g, "").trim(); // retirer ancienne cible
        const nameOnly = cleanLine.replace(/\s*\(\d+ ?pts?\)/i, "").trim(); // retirer (x pts)
        return nameOnly === joueur ? `🎯 ${cleanLine}` : line;
      })
      .join("<br>");

    joueurTd.innerHTML = updatedHTML;
  });
}
// Masquer les deux lignes du tableau correspondant aux missiles
const missilesRowIndex = data.findIndex(row => row[0] && row[0].toUpperCase() === "MISSILES JOUES");
if (missilesRowIndex !== -1) {
  const rows = table.querySelectorAll("tr");

  // On identifie les lignes affichées correspondant à l’index CSV
  let visibleIndex = 0;
  for (let i = 0; i < rows.length; i++) {
    const rowText = rows[i].textContent.toUpperCase().trim();
    if (visibleIndex === missilesRowIndex || visibleIndex === missilesRowIndex + 1) {
      rows[i].style.display = "none";
    }
    // Incrémenter uniquement si ce n’est pas une ligne fusionnée ou vide
    if (!rows[i].hasAttribute('data-hidden')) {
      visibleIndex++;
    }
  }
}


      markMissiles();

      document.body.appendChild(table);
// 🔁 Vue par joueur (à ne pas activer tout de suite si on teste)
const pronosParJoueur = {};

// 🔍 Trouver les lignes PRONOS et joueurs
      console.log("🔍 Début analyse vue par joueur...");

data.forEach((row, i) => {
  if (row.includes("PRONOS")) {
    console.log("✅ Ligne PRONOS détectée à l’index", i);
    const lignePronos = data[i + 2]; // 2 lignes sous PRONOS
    console.log("➡️ Ligne joueurs brut :", lignePronos);

    if (!lignePronos) {
      console.error("❌ Ligne des joueurs non trouvée");
      return;
    }

    const matchInfo = data[i - 1]?.[0] || `Match ${i}`;

    // 0 = prono "1" | 1 = "N" | 2 = "2"
    ["1", "N", "2"].forEach((prono, idx) => {
      const cell = lignePronos[idx];
      if (!cell) return;

      // Séparer les joueurs sur retours à la ligne
      const joueurs = cell.split(/\r?\n/).map(j => j.trim()).filter(j => j);

      joueurs.forEach(joueur => {
        // Nettoyage : enlever pictos + points éventuels
        const nom = joueur.replace(/^.*?([A-Za-zÀ-ÿ-]+).*$/, '$1');

        if (!pronosParJoueur[nom]) pronosParJoueur[nom] = [];
        pronosParJoueur[nom].push({
          match: matchInfo,
          prono: prono
        });
      });
    });
  }
});

// 🧪 Exemple de log
console.log("📋 Pronos par joueur :", pronosParJoueur);



    },
  });
});
