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

      // Après création du tableau, on marque les missiles
      markMissiles(table);

      const container = document.getElementById("table-container");
      container.innerHTML = "";
      container.appendChild(table);
    },
    error: function (err) {
      const container = document.getElementById("table-container");
      container.textContent = "Erreur : " + err.message;
    }
  });

  function markMissiles(table) {
    const trs = Array.from(table.querySelectorAll("tr"));
    let missilesIndex = -1;
    for (let i = 0; i < trs.length; i++) {
      const cell = trs[i].querySelector("td");
      if (cell && cell.colSpan === 3 && cell.textContent.trim().toUpperCase() === "MISSILES JOUES") {
        missilesIndex = i;
        break;
      }
    }
    if (missilesIndex === -1) {
      console.warn("MISSILES JOUES non trouvé");
      return;
    }

    const missilesLine = trs[missilesIndex + 1];
    if (!missilesLine) {
      console.warn("Ligne après MISSILES JOUES manquante");
      return;
    }
    const missilesCell = missilesLine.querySelector("td");
    if (!missilesCell) {
      console.warn("Cellule fusionnée après MISSILES JOUES manquante");
      return;
    }

    const text = missilesCell.textContent.trim();
    const regex = /(\S+)\s+(\S+)\s+(\S+)\s+([1N2])/g;
    let match;
    let foundAny = false;

    while ((match = regex.exec(text)) !== null) {
      const equipeDom = match[1];
      const equipeExt = match[2];
      const nomJoueur = match[3];
      const prono = match[4];
      console.log(`Missile trouvé : ${equipeDom} vs ${equipeExt} joueur=${nomJoueur} prono=${prono}`);
      foundAny = true;

      // Trouver la ligne match par équipe domicile
      let foundLineIndex = -1;
      for (let i = 0; i < trs.length; i++) {
        const tds = trs[i].querySelectorAll("td");
        for (const td of tds) {
          if (td.childNodes.length === 1 && td.textContent.trim() === equipeDom) {
            foundLineIndex = i;
            break;
          }
        }
        if (foundLineIndex !== -1) break;
      }
      if (foundLineIndex === -1) {
        console.warn(`Ligne de match pour équipe domicile "${equipeDom}" non trouvée`);
        continue;
      }

      // Ligne pronos = 3 lignes après ligne match
      const pronoLineIndex = foundLineIndex + 3;
      if (pronoLineIndex >= trs.length) {
        console.warn(`Ligne pronos (index ${pronoLineIndex}) hors tableau`);
        continue;
      }
      const pronoLine = trs[pronoLineIndex];
      const pronoTds = pronoLine.querySelectorAll("td");

      let marked = false;
      for (const td of pronoTds) {
        const textContent = td.textContent.trim();
        const nomSimple = textContent.split(/\s|\(/)[0];
        if (nomSimple.toLowerCase() === nomJoueur.toLowerCase()) {
          if (!td.textContent.startsWith("* ")) {
            td.textContent = "* " + td.textContent;
            console.log(`Marqué joueur ${nomJoueur} avec *`);
            marked = true;
          }
          break;
        }
      }
      if (!marked) console.warn(`Joueur ${nomJoueur} non trouvé sur la ligne pronos`);
    }
    if (!foundAny) {
      console.warn("Aucun missile trouvé dans le texte");
    }
  }
});
