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



function afficherVueMatch() {
  container.innerHTML = "Chargement des données…";

  Papa.parse(csvUrlMatch, {
    download: true,
    header: false,
    complete: function(results) {
      const data = results.data;
      container.innerHTML = ""; // Clear container

      const table = document.createElement("table");
      table.className = "match-table";

      let skipNext = false;

      for (let i = 0; i < data.length; i++) {
        if (skipNext) {
          skipNext = false;
          continue;
        }

        const row = data[i];
        const tr = document.createElement("tr");

        // Gestion fusion de cellules titres
        if (row[0] && (row[0].startsWith("JOURNEE") || row[0].startsWith("MATCH") || row[0].startsWith("CLASSEMENT JOURNEE") || row[0].startsWith("MISSILES JOUES") || row[0].startsWith("JACKPOT JOUES"))) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = row[0].toLowerCase().replace(/\s/g, "-"); // classe css spécifique
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);

          // Pour MISSILES JOUES, JACKPOT JOUES et CLASSEMENT JOURNEE, on fusionne avec la ligne suivante
          if (row[0] === "MISSILES JOUES" || row[0] === "JACKPOT JOUES" || row[0] === "CLASSEMENT JOURNEE") {
            if (data[i + 1]) {
              const tr2 = document.createElement("tr");
              const td2 = document.createElement("td");
              td2.colSpan = 3;
              td2.className = row[0].toLowerCase().replace(/\s/g, "-") + "-content";
              td2.innerHTML = (data[i + 1][0] || "").replace(/\r?\n/g, "<br>");
              tr2.appendChild(td2);
              table.appendChild(tr2);
              skipNext = true;
            }
          }

          continue;
        }

        // Ligne classique - on affiche les logos dans colonnes 0 et 2
        row.forEach((cell, idx) => {
          const td = document.createElement("td");

          if (idx === 0 || idx === 2) {
            if (cell) {
              const logoName = cell.toLowerCase().replace(/\s/g, "-");
              const img = document.createElement("img");
              img.src = baseImagePath + logoName + ".png";
              img.alt = cell + " logo";
              img.className = "team-logo";
              td.style.textAlign = "center";
              td.appendChild(img);
              td.appendChild(document.createElement("br"));
              td.appendChild(document.createTextNode(cell));
            } else {
              td.textContent = cell;
            }
          } else {
            // Gestion du contenu texte avec retour à la ligne selon le contenu (ex : plusieurs joueurs séparés par ")")
            if (cell && cell.includes(")")) {
              const parts = cell.split(")").filter(x => x.trim() !== "");
              td.innerHTML = parts.map(p => p.trim() + ")").join("<br>");
            } else if (cell && cell.trim().split(/\s+/).length > 1) {
              const parts = cell.trim().split(/\s+/);
              td.innerHTML = parts.join("<br>");
            } else {
              td.textContent = cell;
            }
          }

          // Gestion affichage missile 🎯 : Si dans la cellule il y a un joueur ayant joué un missile sur ce match, ajouter 🎯
          // Remarque : il faut parser la section MISSILES JOUES, donc on la récupère au préalable
          // Comme la section MISSILES JOUES est fusionnée, on peut la chercher dans data

          // On gère ça après la création du tableau pour éviter doublons (cf plus bas)

          tr.appendChild(td);
        });

        table.appendChild(tr);
      }

      // --- Gestion ajout missile 🎯 ---
      // Récupérer la ligne des missiles joués dans data (c'est juste après la ligne "MISSILES JOUES")
      // Elle est déjà affichée dans le tableau mais on veut aussi taguer les joueurs dans les cellules correspondantes

      // Trouver la ligne index de MISSILES JOUES
      let missilesLigne = data.findIndex(row => row[0] && row[0].toUpperCase() === "MISSILES JOUES");
      if (missilesLigne >= 0 && data[missilesLigne + 1]) {
        const missilesTexte = data[missilesLigne + 1][0];
        // Exemple : "PSG OM Tibo 1\nLyon Nantes Simon 2" etc.
        // Parse chaque missile
        const missiles = missilesTexte.split("\n").map(l => l.trim()).filter(l => l.length > 0);

        // Parcourir toutes les lignes du tableau pour taguer les joueurs
        // On suppose que dans le tableau les noms des joueurs sont dans des cellules, il faut trouver la cellule qui contient le nom + vérifier prono = 1/N/2 pour match
        // Cette approche est complexe car on n'a pas de mapping direct entre match, joueur et cellule dans ce script simplifié.

        // Donc on fait simple : on cherche dans toutes les cellules du tableau un texte correspondant au joueur + prono = prono missile sur la même ligne de match
        // En pratique, on peut surligner le joueur dans la cellule correspondante

        // Fonction simple pour ajouter 🎯 dans la cellule si match et joueur et prono correspondent

        missiles.forEach(missile => {
          const parts = missile.split(" ");
          if (parts.length < 4) return;
          const dom = parts[0].toLowerCase();
          const ext = parts[1].toLowerCase();
          const joueur = parts[2];
          const prono = parts[3];

          // Parcourir toutes les tr du tableau
          for (const tr of table.querySelectorAll("tr")) {
            // On cherche ligne match où équipe domicile et extérieur sont en colonne 0 et 2
            const tdDom = tr.children[0];
            const tdExt = tr.children[2];
            if (!tdDom || !tdExt) continue;
            if (!tdDom.textContent || !tdExt.textContent) continue;

            if (tdDom.textContent.toLowerCase() === dom && tdExt.textContent.toLowerCase() === ext) {
              // On a la bonne ligne match
              // On cherche dans cette ligne les joueurs qui ont fait le prono
              for (let i = 1; i < tr.children.length; i++) {
                const td = tr.children[i];
                if (!td) continue;
                // Si la cellule contient le nom du joueur et le prono (ex: "Tibo 1)")
                // On simplifie la détection en cherchant le joueur et prono dans la cellule
                if (td.textContent.includes(joueur) && td.textContent.includes(prono)) {
                  // Ajouter 🎯 à la fin s'il n'est pas déjà là
                  if (!td.textContent.includes("🎯")) {
                    td.innerHTML += " 🎯";
                  }
                }
              }
            }
          }
        });
      }

      container.appendChild(table);
    },
    error: function(err) {
      container.textContent = 'Erreur de chargement : ' + err.message;
    }
  });
}





// Fonction affichage vue match (ton gros code perso)
function afficherVueMatch() {

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


         // Fusion des lignes JACKPOT JOUES + suivante sur 3 colonnes
        if (row[0] && row[0].toUpperCase() === "JACKPOT JOUES") {
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
