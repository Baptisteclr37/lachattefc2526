document.addEventListener("DOMContentLoaded", () => {
  const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");

      let lastLineWasMatch = false;
      let currentMatchTeams = null; // [domicile, exterieur]
      const matchMap = new Map(); // clé: domicile_exterieur => ligne pronos

      let missileData = [];

      // Normalisation
      const normalize = str => str.trim().toLowerCase().replace(/\s+/g, "-");

      data.forEach((row, i) => {
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
          currentMatchTeams = null;
          return;
        }

        // Ligne des équipes après MATCH (ligne juste après MATCH)
        if (lastLineWasMatch) {
          currentMatchTeams = [row[0].trim(), row[2].trim()];
          lastLineWasMatch = false;

          // Affichage avec logos
          row.forEach((cell, index) => {
            const td = document.createElement("td");
            if (index === 0 || index === 2) {
              const teamName = cell.trim();
              if (teamName) {
                const logoUrl = baseImagePath + normalize(teamName) + ".png";
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
              td.textContent = cell;
            }
            tr.appendChild(td);
          });
          table.appendChild(tr);
          return;
        }

        if (row[0] && row[0].toUpperCase() === "PRONOS") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "pronos-header";
          td.textContent = "PRONOS";
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        // Ligne des pronos (après "PRONOS")
        if (currentMatchTeams && i > 0 && data[i - 1][0] && data[i - 1][0].toUpperCase() === "PRONOS") {
          // Clé = "domicile___exterieur"
          const key = normalize(currentMatchTeams[0]) + "___" + normalize(currentMatchTeams[1]);
          console.log(`Mapping prono ligne ${i} => clé : ${key}`);
          matchMap.set(key, tr);
        }

        // Traitement missiles et autres lignes...
        if (row[0] && row[0].toUpperCase() === "MISSILES JOUES") return;
        if (i > 0 && data[i - 1][0] && data[i - 1][0].toUpperCase() === "MISSILES JOUES") {
          missileData = (row[0] || "").split(/\r?\n/).map(x => x.trim()).filter(x => x !== "");
          console.log("Missiles détectés :", missileData);
          return;
        }

        // Remplissage classique des cellules sinon
        row.forEach((cell) => {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });

      // Traitement missiles (plus robuste)
      missileData.forEach(line => {
        console.log("Traitement missile ligne :", line);

        // Pour extraire équipe domicile et extérieur, on cherche quelle clé correspond dans matchMap :
        // Exemple ligne missile : "Nantes Paris SG Batist 1"
        // On teste toutes les clés matchMap pour trouver celle où domicile et exterieur sont au début de la ligne

        let matchedKey = null;
        let joueur = null;
        let prono = null;

        for (const key of matchMap.keys()) {
          const [dom, ext] = key.split("___");
          // Dom et ext en tirets, ligne en texte brut en mots séparés par espaces

          const normalizedLine = line.toLowerCase().replace(/\s+/g, " ");
          const domRegex = dom.replace(/-/g, " ");
          const extRegex = ext.replace(/-/g, " ");

          if (normalizedLine.startsWith(domRegex + " " + extRegex) || normalizedLine.startsWith(domRegex + " " + extRegex.split(" ")[0])) {
            matchedKey = key;
            break;
          }
        }

        if (!matchedKey) {
          console.log("Aucun match trouvé pour missile :", line);
          return;
        }

        // Enlever domicile et exterieur du début de la ligne
        let rest = line.toLowerCase();
        const [dom, ext] = matchedKey.split("___");
        const domStr = dom.replace(/-/g, " ");
        const extStr = ext.replace(/-/g, " ");
        rest = rest.substring(domStr.length).trim();
        if (rest.startsWith(extStr)) rest = rest.substring(extStr.length).trim();

        // Le reste doit être "Joueur Prono"
        const restParts = rest.split(" ");
        if (restParts.length < 2) {
          console.log("Reste missile invalide :", rest);
          return;
        }
        joueur = restParts[0];
        prono = restParts[1].toUpperCase();

        if (!["1", "N", "2"].includes(prono)) {
          console.log("Prono invalide :", prono);
          return;
        }

        console.log({ matchedKey, joueur, prono });

        const tr = matchMap.get(matchedKey);
        const pronoColIndex = { "1": 0, "N": 1, "2": 2 }[prono];
        if (!tr || !tr.children[pronoColIndex]) {
          console.log("Colonne prono non trouvée");
          return;
        }
        const td = tr.children[pronoColIndex];
        const lines = td.innerHTML.split("<br>");
        const updatedLines = lines.map(line => {
          const cleanLine = line.replace("🎯", "").trim();
          if (cleanLine === joueur || cleanLine.startsWith(joueur + " ")) {
            return cleanLine + " 🎯";
          }
          return line;
        });
        td.innerHTML = updatedLines.join("<br>");
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
