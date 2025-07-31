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

      // Construction du tableau
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

      // *** Nouvelle fonction pour traiter les missiles joués ***
      function markMissiles(table) {
        // Trouver la ligne contenant "MISSILES JOUES"
        const trs = Array.from(table.querySelectorAll("tr"));
        let missilesIndex = -1;
        for (let i = 0; i < trs.length; i++) {
          const cell = trs[i].querySelector("td");
          if (cell && cell.colSpan === 3 && cell.textContent.trim().toUpperCase() === "MISSILES JOUES") {
            missilesIndex = i;
            break;
          }
        }
        if (missilesIndex === -1) return; // pas trouvé

        // Ligne juste en dessous avec toutes les chaînes dans une seule cellule fusionnée
        const missilesLine = trs[missilesIndex + 1];
        if (!missilesLine) return;

        const missilesCell = missilesLine.querySelector("td");
        if (!missilesCell) return;

        // On récupère tout le texte, puis on découpe en chaînes selon le pattern : EquipeDom EquipeExt NomDuJoueur Prono
        // On suppose que prono est toujours 1, N ou 2 à la fin de chaque chaîne
        // Exemple : "Brest Lille Mat 1 Nantes ParisSG Batist 1"
        const text = missilesCell.textContent.trim();

        // Regex pour extraire toutes les chaînes
        // \b(\S+)\s+(\S+)\s+(\S+)\s+([1N2])\b
        const regex = /(\S+)\s+(\S+)\s+(\S+)\s+([1N2])/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
          const equipeDom = match[1];
          const equipeExt = match[2];
          const nomJoueur = match[3];
          const prono = match[4];
          // console.log({ equipeDom, equipeExt, nomJoueur, prono });

          // Remonter dans le tableau pour trouver la ligne avec cellule texte = equipeDom
          let foundLineIndex = -1;
          for (let i = 0; i < trs.length; i++) {
            const tds = trs[i].querySelectorAll("td");
            for (const td of tds) {
              // On cherche une cellule qui contient EXACTEMENT le texte equipeDom,
              // mais en ignorant les spans, images etc.
              if (td.childNodes.length === 1 && td.textContent.trim() === equipeDom) {
                foundLineIndex = i;
                break;
              }
            }
            if (foundLineIndex !== -1) break;
          }
          if (foundLineIndex === -1) continue; // non trouvé

          // Ligne du prono = foundLineIndex + 3 (car 3 lignes en dessous)
          const pronoLineIndex = foundLineIndex + 3;
          if (pronoLineIndex >= trs.length) continue;

          const pronoLine = trs[pronoLineIndex];
          const pronoTds = pronoLine.querySelectorAll("td");

          // Chercher dans les 3 colonnes de prono la cellule qui contient nomJoueur
          // Les noms peuvent avoir suffixe ' (x pts)' -> on ignore le suffixe
          for (const td of pronoTds) {
            const textContent = td.textContent.trim();
            // Extraire le nom avant le premier espace ou parenthèse
            const nomSimple = textContent.split(/\s|\(/)[0];
            if (nomSimple.toLowerCase() === nomJoueur.toLowerCase()) {
              // Ajouter le emoji 🎯 au début s'il n'y est pas déjà
              if (!td.textContent.startsWith("🎯")) {
                td.textContent = "🎯 " + td.textContent;
              }
              break;
            }
          }
        }
      }

      markMissiles(table);

      document.body.appendChild(table);
    },
    error: function (err) {
      console.error("Erreur chargement CSV:", err);
    },
  });
});
