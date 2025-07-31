document.addEventListener("DOMContentLoaded", function () {
  Papa.parse("https://baptisteclr37.github.io/lachattefc2526/data.csv", {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");
      table.classList.add("table");

      let currentSection = null;
      let rowIndex = 0;

      data.forEach((row, index) => {
        if (row.length === 1 && row[0].trim() !== "") {
          currentSection = row[0].trim().toUpperCase();
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.colSpan = 3;
          td.classList.add("section-title");
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
        } else if (currentSection === "MISSILES JOUES" && index === rowIndex + 1) {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.colSpan = 3;
          td.classList.add("missiles-list");
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
        } else if (row.join("").trim() !== "") {
          const tr = document.createElement("tr");
          row.forEach((cell) => {
            const td = document.createElement("td");
            if (cell.includes("\n")) {
              td.innerHTML = cell.replace(/\n/g, "<br>");
            } else {
              td.textContent = cell;
            }
            tr.appendChild(td);
          });
          table.appendChild(tr);
        }
        rowIndex = index;
      });

      function markMissiles() {
        const missilesRowIndex = data.findIndex(
          (row) => row[0] && row[0].toUpperCase() === "MISSILES JOUES"
        );
        if (missilesRowIndex === -1) {
          console.log("Pas de section MISSILES JOUES trouvée");
          return;
        }

        const missilesText = data[missilesRowIndex + 1]?.[0];
        if (!missilesText) {
          console.log("Aucun missile listé après MISSILES JOUES");
          return;
        }

        const missiles = missilesText
          .split(/\r?\n/)
          .filter((x) => x.trim() !== "");

        const trs = table.querySelectorAll("tr");

        missiles.forEach((missile) => {
          const parts = missile.trim().split(/\s+/);
          if (parts.length < 4) return;

          const equipeDom = parts[0];
          const equipeExt = parts[1];
          const joueur = parts[2];
          const prono = parts[3];

          console.log(
            `Missile trouvé : ${equipeDom} vs ${equipeExt} joueur=${joueur} prono=${prono}`
          );

          let foundLineIndex = -1;

          for (let i = 0; i < trs.length; i++) {
            const tds = trs[i].querySelectorAll("td");

            for (const td of tds) {
              const span = td.querySelector("span");
              const text = span ? span.textContent.trim() : td.textContent.trim();

              if (text === equipeDom) {
                foundLineIndex = i;
                break;
              }
            }

            if (foundLineIndex !== -1) break;
          }

          if (foundLineIndex === -1) {
            console.warn(
              `Ligne de match pour équipe domicile "${equipeDom}" non trouvée`
            );
            return;
          }

          const choixTr = trs[foundLineIndex + 1];
          const pronosTr = trs[foundLineIndex + 2];

          if (!pronosTr) {
            console.warn(
              `Pas de ligne PRONOS associée au match de ${equipeDom}`
            );
            return;
          }

          const pronosTds = pronosTr.querySelectorAll("td");
          let pronoColIndex = -1;

          if (choixTr) {
            const choixTds = choixTr.querySelectorAll("td");
            for (let c = 0; c < choixTds.length; c++) {
              if (choixTds[c].textContent.trim() === prono) {
                pronoColIndex = c;
                break;
              }
            }
          }

          if (pronoColIndex === -1) {
            console.warn(
              `Prono ${prono} non trouvé dans la ligne des choix pour le match ${equipeDom} vs ${equipeExt}`
            );
            return;
          }

          const cibleTd = pronosTds[pronoColIndex];
          if (!cibleTd) return;

          const lines = cibleTd.innerHTML.split("<br>");
          let found = false;

          for (let i = 0; i < lines.length; i++) {
            const cleanName = lines[i].replace(" 🎯", "").trim();
            if (cleanName === joueur) {
              lines[i] += " 🎯";
              found = true;
              break;
            }
          }

          if (!found) {
            console.warn(
              `Joueur ${joueur} non trouvé dans les pronos pour le match ${equipeDom} vs ${equipeExt}`
            );
            return;
          }

          cibleTd.innerHTML = lines.join("<br>");
        });
      }

      markMissiles();
      document.body.appendChild(table);
    },
  });
});
