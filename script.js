document.addEventListener("DOMContentLoaded", () => {
  const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");
      const missiles = [];

      let lastLineWasMatch = false;
      let skipNext = false;

      // Étape 1 : extraire les missiles
      data.forEach((row, i) => {
        if (row[0] && row[0].toUpperCase().startsWith("MISSILES JOUES")) {
          const missileBlock = data[i + 1]?.[0] || "";
          const lines = missileBlock.split(/\r?\n/);
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 4) {
              const equipeDomicile = parts[0];
              const equipeExterieur = parts[1];
              const joueur = parts[2];
              const prono = parts[3];
              missiles.push({ equipeDomicile, equipeExterieur, joueur, prono });
            }
          });
        }
      });

      // Étape 2 : construire le tableau
      data.forEach((row, i) => {
        const tr = document.createElement("tr");

        if (!row.length || (row[0] && row[0].toUpperCase().startsWith("MISSILES JOUES"))) {
          skipNext = true;
          return;
        }

        if (skipNext) {
          skipNext = false;
          return; // on saute la ligne suivante contenant les missiles
        }

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

        // Pour les autres lignes
        row.forEach((cell, index) => {
          const td = document.createElement("td");

          // Si la ligne suit une ligne MATCH, on met les logos
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
            // Si cellule avec joueur + points
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

        // Intégration missiles 🎯 si applicable
        if (i > 2 && data[i - 2][0]?.toUpperCase().startsWith("MATCH")) {
          const matchInfoRow = data[i - 2];
          const equipeDom = data[i - 1][0]?.trim();
          const equipeExt = data[i - 1][2]?.trim();

          tr.querySelectorAll("td").forEach((td, index) => {
            const text = td.innerText || "";
            const lignes = text.split("\n");

            const prono = index === 0 ? "1" : index === 1 ? "N" : index === 2 ? "2" : "";

            td.innerHTML = lignes.map(line => {
              let clean = line.trim();
              const nom = clean.split(" ")[0]; // récupère le prénom seulement
              const isMissile = missiles.some(m =>
                m.equipeDomicile === equipeDom &&
                m.equipeExterieur === equipeExt &&
                m.joueur.toLowerCase() === nom.toLowerCase() &&
                m.prono === prono
              );
              return isMissile ? "🎯 " + clean : clean;
            }).join("<br>");
          });
        }

        table.appendChild(tr);
        lastLineWasMatch = false;
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
