document.addEventListener("DOMContentLoaded", () => {
  const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");

      let lastLineWasMatch = false;
      let currentMatchIndex = -1;
      let currentDomicile = "";
      let currentExterieur = "";
      let missilesData = null; // tableau des missiles, index correspondant à colonnes joueurs
      let skipNextLine = false; // pour ne pas afficher MISSILES JOUES et la ligne suivante

      data.forEach((row, i) => {
        // Gestion des lignes "MISSILES JOUES" et la ligne qui suit, à ignorer à l'affichage
        if (row[0] && row[0].toUpperCase() === "MISSILES JOUES") {
          missilesData = null; // on remet à null au cas où
          skipNextLine = true; // ligne suivante est données missiles à traiter mais non affichée
          return; // on ne crée pas de tr pour cette ligne
        }

        if (skipNextLine) {
          // Cette ligne contient les missiles, on la stocke dans missilesData
          missilesData = row;
          skipNextLine = false;
          return; // ne pas afficher
        }

        const tr = document.createElement("tr");

        // Ligne MATCHX
        if (row[0] && row[0].toUpperCase().startsWith("MATCH")) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "match-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);

          lastLineWasMatch = true;
          currentMatchIndex = i;
          currentDomicile = "";
          currentExterieur = "";
          return;
        }

        // Ligne équipes & résultats (juste après MATCHX)
        if (i === currentMatchIndex + 1) {
          currentDomicile = row[0] ? row[0].trim() : "";
          currentExterieur = row[2] ? row[2].trim() : "";

          row.forEach(cell => {
            const td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
          });
          table.appendChild(tr);
          return;
        }

        // Ligne PRONOS (label)
        if (row[0] && row[0].toUpperCase() === "PRONOS") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "pronos-header";
          td.textContent = "PRONOS";
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        // Ligne pronos des joueurs (ligne juste après PRONOS)
        if (i === currentMatchIndex + 3) {
          row.forEach((cell, colIndex) => {
            const td = document.createElement("td");
            if (colIndex === 0) {
              // Première colonne : souvent vide ou autre info, on laisse tel quel
              td.textContent = cell;
            } else {
              let content = cell;

              if (missilesData && missilesData[colIndex]) {
                // Format attendu : "NomJoueur Prono" dans cell
                const parts = cell.trim().split(" ");
                const nomJoueurDansCell = parts[0] || "";
                const pronoDansCell = parts[1] || "";

                const missileVal = missilesData[colIndex].trim();

                // Construire clé missile : "domicile extérieur joueur prono"
                const missileTarget = `${currentDomicile} ${currentExterieur} ${nomJoueurDansCell} ${pronoDansCell}`;

                if (missileVal === missileTarget) {
                  content += " 🎯"; // cible smiley
                }
              }
              td.textContent = content;
            }
            tr.appendChild(td);
          });
          table.appendChild(tr);
          return;
        }

        // Les autres lignes (ex: J01 titre, classement, etc.) restent inchangées
        // Ligne 0 : Titre J01 fusionné
        if (i === 0 && row[0]) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        // Ligne CLASSEMENT JOURNEE fusionnée sur 3 colonnes avec style
        if (row[0] && row[0].toUpperCase() === "CLASSEMENT JOURNEE") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        // Ligne contenant le classement de la journée à trier
        if (i > 0 && data[i - 1][0] && data[i - 1][0].toUpperCase() === "CLASSEMENT JOURNEE") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee";

          let classementRaw = row[0] || "";
          let classementArray = classementRaw.split(/\r?\n/).filter(x => x.trim() !== "");
          if (classementArray.length === 1) {
            classementArray = classementRaw.split(/\s{2,}/).filter(x => x.trim() !== "");
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

        // Pour les autres lignes simples on affiche tout normalement
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
        if (lastLineWasMatch) lastLineWasMatch = false;
      });

      const container = document.getElementById("table-container");
      container.innerHTML = "";
      container.appendChild(table);
    },
    error: function (err) {
      const container = document.getElementById("table-container");
      container.textContent = "Erreur : " + err.message;
    }
  });
});
