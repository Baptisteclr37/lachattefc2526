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
        // Récupérer la ligne de texte des missiles joués
        const missilesRowIndex = data.findIndex(row => row[0] && row[0].toUpperCase() === "MISSILES JOUES");
        if (missilesRowIndex === -1) {
          console.log("Pas de section MISSILES JOUES trouvée");
          return;
        }

        // Le texte contenant les missiles est sur la ligne juste après MISSILES JOUES
        const missilesText = data[missilesRowIndex + 1]?.[0];
        if (!missilesText) {
          console.log("Aucun missile listé après MISSILES JOUES");
          return;
        }

        const missiles = missilesText.split(/\r?\n/).filter(x => x.trim() !== "");

        // On récupère toutes les lignes du tableau affiché
        const trs = table.querySelectorAll("tr");

        missiles.forEach(missile => {
          // Format attendu : "ÉquipeDomicile ÉquipeExtérieur Joueur Prono"
          const parts = missile.trim().split(/\s+/);
          if (parts.length < 4) return;

          // On extrait équipe domicile, extérieur, joueur et prono
          const equipeDom = parts[0];
          const equipeExt = parts[1];
          const joueur = parts[2];
          const prono = parts[3];

          console.log(`Missile trouvé : ${equipeDom} vs ${equipeExt} joueur=${joueur} prono=${prono}`);

          // Trouver la ligne du match dans le tableau en cherchant par équipe domicile
          let foundLineIndex = -1;

          for (let i = 0; i < trs.length; i++) {
            const tds = trs[i].querySelectorAll("td");

            for (const td of tds) {
              // Chercher le texte uniquement dans le <span> si présent, sinon le contenu textuel normal
              const span = td.querySelector('span');
              const text = span ? span.textContent.trim() : td.textContent.trim();

              if (text === equipeDom) {
                foundLineIndex = i;
                break;
              }
            }

            if (foundLineIndex !== -1) break;
          }

          if (foundLineIndex === -1) {
            console.warn(`Ligne de match pour équipe domicile "${equipeDom}" non trouvée`);
            return;
          }

          const matchTr = trs[foundLineIndex];

          // Le prono est affiché dans la cellule correspondant à la colonne (1, N, 2)
          // On doit chercher la colonne du prono pour ce match
          // Pour simplifier, on va parcourir les td à partir du 4e (index 3) et voir si le joueur y est mentionné

          // On trouve la cellule où le joueur est mentionné dans la ligne des pronos juste après le match
          // On considère que la ligne des pronos est celle qui suit immédiatement la ligne du match
          const pronosTr = trs[foundLineIndex + 2]; // ligne après le "PRONOS"

          if (!pronosTr) {
            console.warn(`Pas de ligne PRONOS associée au match de ${equipeDom}`);
            return;
          }

          const pronosTds = pronosTr.querySelectorAll("td");

          // On cherche la colonne du joueur dans la ligne PRONOS
          let joueurColIndex = -1;
          for (let c = 0; c < pronosTds.length; c++) {
            // Le joueur peut être sur plusieurs lignes, on vérifie si son nom est dans le texte
            if (pronosTds[c].textContent.includes(joueur)) {
              joueurColIndex = c;
              break;
            }
          }

          if (joueurColIndex === -1) {
            console.warn(`Joueur ${joueur} non trouvé dans les pronos pour le match ${equipeDom} vs ${equipeExt}`);
            return;
          }

          // Le prono est un des 3 choix : 1, N ou 2.
          // Sur la ligne juste avant PRONOS (ligne juste avant), les choix "1", "N", "2" sont listés.

          const choixTr = trs[foundLineIndex + 1]; // ligne juste avant PRONOS

          if (!choixTr) {
            console.warn(`Pas de ligne des choix 1/N/2 trouvée pour le match ${equipeDom} vs ${equipeExt}`);
            return;
          }

          const choixTds = choixTr.querySelectorAll("td");

          // Trouver la colonne où le prono du missile correspond (ex : la colonne où "1" est écrit)

          let pronoColIndex = -1;
          for (let c = 0; c < choixTds.length; c++) {
            if (choixTds[c].textContent.trim() === prono) {
              pronoColIndex = c;
              break;
            }
          }

          if (pronoColIndex === -1) {
            console.warn(`Prono ${prono} non trouvé dans la ligne des choix pour le match ${equipeDom} vs ${equipeExt}`);
            return;
          }

          // On ajoute une icône 🎯 à côté du joueur dans la cellule correspondante au prono

          const cibleTd = pronosTds[pronoColIndex];
          if (!cibleTd) return;

          // Vérifier si l’icône n’est pas déjà présente pour éviter doublon
          if (!cibleTd.querySelector(".missile-icon")) {
            const spanMissile = document.createElement("span");
            spanMissile.textContent = " 🎯";
            spanMissile.className = "missile-icon";
            cibleTd.appendChild(spanMissile);
          }
        });
      }

      markMissiles();

      document.body.appendChild(table);
    },
  });
});
