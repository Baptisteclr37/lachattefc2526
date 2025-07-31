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

      // === JACKPOT JOUES - Fusionner sur 3 colonnes ===
      // === JACKPOT JOUES - Fusionner sur 3 colonnes et formater correctement ===
const jackpotRowIndex = data.findIndex(row => row[0] && row[0].toUpperCase() === "JACKPOT JOUES");
if (jackpotRowIndex !== -1) {
  const rows = table.querySelectorAll("tr");

  // Trouver la ligne visible correspondant à JACKPOT JOUES dans le tableau HTML
  let visibleIndex = 0;
  for (let i = 0; i < rows.length; i++) {
    const rowText = rows[i].textContent.toUpperCase().trim();

    if (visibleIndex === jackpotRowIndex || visibleIndex === jackpotRowIndex + 1) {
    if (visibleIndex === jackpotRowIndex) {
      // Ligne du titre JACKPOT JOUES
      const cells = rows[i].querySelectorAll("td");
      if (cells.length > 0) {
        const content = cells[0].innerHTML;
        rows[i].innerHTML = `<td colspan="3" style="font-weight: bold;">${content}</td>`;
      }
    }

    if (visibleIndex === jackpotRowIndex + 1) {
      // Ligne du contenu des JACKPOTS
      const cells = rows[i].querySelectorAll("td");
      if (cells.length > 0) {
        const rawItems = cells[0].innerText.trim().split(/\s+/); // Découpe par espace
        const formatted = [];

        for (let j = 0; j < rawItems.length; j += 4) {
          const line = rawItems.slice(j, j + 4).join(" ");
          formatted.push(line);
        }

        rows[i].innerHTML = `<td colspan="3">${formatted.join("<br>")}</td>`;
      }
    }

    // Incrémenter que si ce n’est pas une ligne masquée
    if (!rows[i].hasAttribute('data-hidden')) {
      visibleIndex++;
    }
  }
}



      document.body.appendChild(table);
    },
  });
});
