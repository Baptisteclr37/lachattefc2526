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
  missiles.forEach(({ equipeDom, equipeExt, joueur, prono }) => {
    // Trouver la ligne du match (comme tu fais déjà)
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

    // Trouver la ligne des choix ("1","N","2")
    const choixTr = trs[foundLineIndex + 1];
    if (!choixTr) return;

    const choixTds = choixTr.querySelectorAll("td");
    let pronoColIndex = -1;
    for (let c = 0; c < choixTds.length; c++) {
      if (choixTds[c].textContent.trim() === prono) {
        pronoColIndex = c;
        break;
      }
    }
    if (pronoColIndex === -1) {
      console.warn(`Prono ${prono} non trouvé dans la ligne des choix`);
      return;
    }

    // Maintenant, parcourir les lignes suivantes pour chercher le joueur dans la colonne pronoColIndex
    let joueurFound = false;
    for (let r = foundLineIndex + 2; r < trs.length; r++) {
      const tds = trs[r].querySelectorAll("td");
      if (!tds || tds.length <= pronoColIndex) continue;
      const cellText = tds[pronoColIndex].textContent.trim();
      if (cellText === joueur) {
        // Joueur trouvé, ajouter l’icône 🎯
        const spanMissile = document.createElement("span");
        spanMissile.textContent = " 🎯";
        spanMissile.className = "missile-icon";

        // Vérifier s’il n’est pas déjà ajouté
        if (!tds[pronoColIndex].querySelector(".missile-icon")) {
          tds[pronoColIndex].appendChild(spanMissile);
        }
        joueurFound = true;
        break;
      }
    }
    if (!joueurFound) {
      console.warn(`Joueur ${joueur} non trouvé dans les pronos pour le match ${equipeDom} vs ${equipeExt}`);
    }
  });
}





      
    },
  });
});
