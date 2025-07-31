document.addEventListener("DOMContentLoaded", function () {
  Papa.parse("data.csv", {
    download: true,
    complete: function (results) {
      const data = results.data;
      const container = document.getElementById("csv-table");
      const table = document.createElement("table");

      data.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");

        row.forEach((cell, colIndex) => {
          const td = document.createElement("td");

          if (colIndex === 0 || colIndex === 2) {
            const logo = document.createElement("img");
            logo.src = `images/${cell.trim().toLowerCase().replace(/ /g, "-")}.png`;
            logo.onerror = () => (logo.style.display = "none");
            logo.className = "club-logo";
            td.appendChild(logo);
            const span = document.createElement("span");
            span.textContent = " " + cell;
            td.appendChild(span);
          } else {
            if (cell.includes("\n")) {
              td.innerHTML = cell
                .split("\n")
                .map((line) => line.trim())
                .join("<br>");
            } else {
              td.textContent = cell;
            }
          }

          tr.appendChild(td);
        });

        table.appendChild(tr);
      });

      function markMissiles(table) {
        const rows = table.querySelectorAll("tr");
        let missileDataRow = null;

        for (let i = 0; i < rows.length; i++) {
          const cell = rows[i].cells[0];
          if (cell && cell.textContent.trim().toUpperCase() === "MISSILES JOUES") {
            missileDataRow = rows[i + 1];
            break;
          }
        }

        if (!missileDataRow) return;

        const missileCell = missileDataRow.cells[0];
        if (!missileCell) return;

        const missileLines = missileCell.innerText.split("\n");

        missileLines.forEach((line) => {
          const parts = line.trim().split(/\s+/);
          if (parts.length < 4) return;

          const equipeDom = parts[0];
          const equipeExt = parts[1];
          const joueur = parts[2];
          const prono = parts[3];

          console.log(`Missile trouvé : ${equipeDom} vs ${equipeExt} joueur=${joueur} prono=${prono}`);

          let matchRowIndex = -1;
          for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].cells;
            if (
              cells.length >= 3 &&
              cells[0].textContent.trim().toLowerCase().includes(equipeDom.toLowerCase()) &&
              cells[2].textContent.trim().toLowerCase().includes(equipeExt.toLowerCase())
            ) {
              matchRowIndex = i;
              break;
            }
          }

          if (matchRowIndex === -1) {
            console.warn(`Ligne de match pour équipe domicile "${equipeDom}" non trouvée`);
            return;
          }

          const pronosRow = rows[matchRowIndex + 3];
          if (!pronosRow) return;

          const pronosTds = pronosRow.querySelectorAll("td");
          let joueurColIndex = -1;
          const joueurLower = joueur.toLowerCase();
          for (let c = 0; c < pronosTds.length; c++) {
            const cellText = pronosTds[c].textContent.toLowerCase();
            if (cellText.includes(joueurLower)) {
              joueurColIndex = c;
              break;
            }
          }

          if (joueurColIndex === -1) {
            console.warn(`Joueur ${joueur} non trouvé dans les pronos pour le match ${equipeDom} vs ${equipeExt}`);
            return;
          }

          const cell = pronosTds[joueurColIndex];
          const joueursHTML = cell.innerHTML.split("<br>").map((nom) => {
            const nomClean = nom.replace(/<[^>]*>/g, "").replace(/\s*\(\d+pts\)/, "").trim();
            return nomClean.toLowerCase() === joueurLower ? `🎯 ${nom}` : nom;
          });
          cell.innerHTML = joueursHTML.join("<br>");
        });
      }

      markMissiles(table);

      document.body.appendChild(table);
    },
  });
});
