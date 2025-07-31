document.addEventListener("DOMContentLoaded", () => {
  const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  console.log("Début du parsing CSV");

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      console.log("Parsing terminé, traitement des données");

      const data = results.data;
      const table = document.createElement("table");

      let lastLineWasMatch = false;
      let currentMatchTeams = null; // [domicile, exterieur]
      const matchMap = new Map(); // clé: domicile_exterieur => ligne pronos

      let missileData = [];

      // Normalisation
      const normalize = str => str.trim().toLowerCase().replace(/\s+/g, "-");

      data.forEach((row, i) => {
        console.log(`Traitement ligne ${i}:`, row);

        const tr = document.createElement("tr");

        if (i === 0 && row[0]) {
          console.log("Ligne d'en-tête détectée");
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        if (row[0] && row[0].toUpperCase().startsWith("MATCH")) {
          console.log(`Nouvelle ligne MATCH détectée: ${row[0]}`);
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

        // Ligne des équipes après MATCH
        if (lastLineWasMatch) {
          currentMatchTeams = [row[0].trim(), row[2].trim()];
          console.log("Ligne équipes détectée:", currentMatchTeams);
          lastLineWasMatch = false;

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
          console.log("Ligne PRONOS détectée");
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
          const key = normalize(currentMatchTeams[0]) + "___" + normalize(currentMatchTeams[1]);
          console.log(`Mapping prono ligne ${i} à clé: ${key}`);
          matchMap.set(key, tr);
        }

        // Gestion missiles
        if (row[0] && row[0].toUpperCase() === "MISSILES JOUES") {
          console.log("Début section MISSILES JOUES");
          return;
        }
        if (i > 0 && data[i - 1][0] && data[i - 1][0].toUpperCase() === "MISSILES JOUES") {
          missileData = (row[0] || "").split(/\r?\n/).map(x => x.trim()).filter(x => x !== "");
          console.log("Données missiles reçues:", missileData);
          return;
        }

        // Remplissage cellules classiques
        row.forEach(cell => {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });

      // Traitement des missiles
      console.log("Début traitement missiles");
      missileData.forEach((line, idx) => {
        console.log(`Traitement missile #${idx + 1}:`, line);

        const normalizedLine = line.toLowerCase().replace(/\s+/g, " ").trim();

        let matchedKey = null;

        for (const key of matchMap.keys()) {
          const [dom, ext] = key.split("___");
          const domStr = dom.replace(/-/g, " ");
          const extStr = ext.replace(/-/g, " ");
          if (normalizedLine.startsWith(domStr + " " + extStr)) {
            matchedKey = key;
            console.log(`Match trouvé pour missile: ${matchedKey}`);
            break;
          }
        }

        if (!matchedKey) {
          console.warn("Aucun match trouvé pour missile :", line);
          return;
        }

        const [dom, ext] = matchedKey.split("___");
        const domStr = dom.replace(/-/g, " ");
        const extStr = ext.replace(/-/g, " ");

        let rest = normalizedLine.substring((domStr + " " + extStr).length).trim();

        const restParts = rest.split(" ");
        if (restParts.length < 2) {
          console.warn("Format invalide pour missile, pas assez d'éléments :", rest);
          return;
        }
        const joueur = restParts[0];
        const prono = restParts[1].toUpperCase();

        if (!["1", "N", "2"].includes(prono)) {
          console.warn("Prono missile invalide :", prono);
          return;
        }

        console.log(`Joueur: ${joueur}, Prono: ${prono}`);

        const tr = matchMap.get(matchedKey);
        const pronoColIndex = { "1": 0, "N": 1, "2": 2 }[prono];

        if (!tr) {
          console.error("Ligne de prono introuvable pour la clé:", matchedKey);
          return;
        }

        if (!tr.children[pronoColIndex]) {
          console.error(`Colonne prono '${prono}' introuvable dans la ligne pour ${matchedKey}`);
          return;
        }

        const td = tr.children[pronoColIndex];
        const lines = td.innerHTML.split("<br>");

        const updatedLines = lines.map(lineHtml => {
          let cleanLine = lineHtml.replace(/🎯/g, "").trim();
          if (cleanLine === joueur || cleanLine.startsWith(joueur + " ")) {
            console.log(`Ajout icône 🎯 pour joueur ${joueur} dans colonne '${prono}'`);
            return cleanLine + " 🎯";
          }
          return lineHtml;
        });

        td.innerHTML = updatedLines.join("<br>");
      });

      console.log("Traitement missiles terminé");

      const container = document.getElementById("table-container");
      container.innerHTML = "";
      container.appendChild(table);
    },
    error: function (err) {
      console.error("Erreur lors du chargement du CSV :", err);
      const container = document.getElementById("table-container");
      container.textContent = "Erreur : " + err.message;
    }
  });
});
