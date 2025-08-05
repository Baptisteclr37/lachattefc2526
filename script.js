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

         if (row[0] && row[0].toUpperCase() === "VOIR LE TABLEAU ANCIENNE VERSION") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "tableau-ancienne-version";
          td.textContent = "VOIR LE TABLEAU ANCIENNE VERSION";
          tr.appendChild(td);
          table.appendChild(tr);

      
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
    console.log("🔎 Ligne i+1 :", data[i + 1]);
  console.log("🔎 Ligne i+2 :", data[i + 2]);
  console.log("🔎 Ligne i+3 :", data[i + 3]);

     console.log("➡️ Ligne en i+2 :", data[i + 2]);
    const lignePronos = data[i + 1]; // 2 lignes sous PRONOS
    console.log("➡️ Ligne joueurs brut :", lignePronos);

    if (!lignePronos) {
      console.error("❌ Ligne des joueurs non trouvée");
      return;
    }
  // Ajoute ceci :
  console.log("🧪 Cellule 0 :", lignePronos[0]);
  console.log("🧪 Cellule 1 :", lignePronos[1]);
  console.log("🧪 Cellule 2 :", lignePronos[2]);

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

const ligneTest = data[7]; // essaie avec différentes lignes

if (ligneTest) {
  console.log("🔬 Ligne test complète :", ligneTest);
  ["1", "N", "2"].forEach((prono, idx) => {
    const cell = ligneTest[idx];
    console.log(`📦 Cellule ${prono} :`, cell);

    if (cell) {
      const joueurs = cell.split(/\r?\n/).map(j => j.trim()).filter(j => j);
      joueurs.forEach(joueur => {
        const nom = joueur.replace(/^.*?([A-Za-zÀ-ÿ-]+).*$/, '$1');
        console.log(`👤 ${nom} a joué ${prono}`);
      });
    }
  });
}

      // 📌 Ce script ajoute un bouton de bascule entre la vue par match (vue initiale)
// et la vue par joueur, en conservant intact le contenu initial

window.addEventListener("DOMContentLoaded", () => {
  const pronosParJoueur = {}; // Ce sera rempli plus bas
  const container = document.getElementById("table-container");
  const originalHTML = container.innerHTML;

  // 🔘 Création des boutons de bascule
  const boutonWrapper = document.createElement("div");
  boutonWrapper.id = "boutons-vue";
  boutonWrapper.style.margin = "20px";

  const btnVueJoueur = document.createElement("button");
  btnVueJoueur.id = "btn-vue-joueur";
  btnVueJoueur.textContent = "Basculer en vue joueurs";

  const btnVueMatch = document.createElement("button");
  btnVueMatch.id = "btn-vue-match";
  btnVueMatch.textContent = "Vue par match";
  btnVueMatch.style.display = "none";

  boutonWrapper.appendChild(btnVueJoueur);
  boutonWrapper.appendChild(btnVueMatch);
  document.body.insertBefore(boutonWrapper, container);

  // 🔁 Remplir pronosParJoueur depuis les lignes PRONOS du CSV déjà parsé
  if (window.data) {
    window.data.forEach((row, i) => {
      if (row.includes("PRONOS")) {
        const lignePronos = window.data[i + 1];
        const matchInfo = window.data[i - 1]?.[0] || `Match ${i}`;

        ["1", "N", "2"].forEach((prono, idx) => {
          const cell = lignePronos[idx];
          if (!cell) return;
          const joueurs = cell.split(/\r?\n/).map(j => j.trim()).filter(j => j);

          joueurs.forEach(joueur => {
            const nom = joueur.replace(/^.*?([A-Za-zÀ-ſ-]+).*$/, "$1");
            if (!pronosParJoueur[nom]) pronosParJoueur[nom] = [];
            pronosParJoueur[nom].push({ match: matchInfo, prono });
          });
        });
      }
    });
  }

  // ▶️ Fonction pour générer tableau vue joueur
  function genererTableauVueParJoueur(pronos) {
    const table = document.createElement("table");
    table.className = "vue-par-joueur";

    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th>Joueur</th><th>Match</th><th>Prono</th></tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    Object.entries(pronos).forEach(([joueur, matchs]) => {
      matchs.forEach((info, idx) => {
        const tr = document.createElement("tr");
        if (idx === 0) {
          const tdJoueur = document.createElement("td");
          tdJoueur.textContent = joueur;
          tdJoueur.rowSpan = matchs.length;
          tr.appendChild(tdJoueur);
        }
        const tdMatch = document.createElement("td");
        tdMatch.textContent = info.match;
        const tdProno = document.createElement("td");
        tdProno.textContent = info.prono;
        tr.appendChild(tdMatch);
        tr.appendChild(tdProno);
        tbody.appendChild(tr);
      });
    });
    table.appendChild(tbody);
    return table;
  }

  // 🎯 Bouton vue joueur -> affiche la vue par joueur
  btnVueJoueur.addEventListener("click", () => {
    container.innerHTML = "";
    container.appendChild(genererTableauVueParJoueur(pronosParJoueur));
    btnVueJoueur.style.display = "none";
    btnVueMatch.style.display = "inline-block";
  });

  // 🎯 Bouton vue match -> restaure la vue originale
  btnVueMatch.addEventListener("click", () => {
    container.innerHTML = originalHTML;
    btnVueJoueur.style.display = "inline-block";
    btnVueMatch.style.display = "none";
  });
});

    },
  });
});
