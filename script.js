fetch("data.csv")
  .then((response) => response.text())
  .then((text) => {
    const rows = text.trim().split("\n").map((row) => row.split("\t"));
    const container = document.getElementById("table-container");
    const table = document.createElement("table");
    container.innerHTML = "";
    table.classList.add("results-table");

    const logoBasePath = "images/";

    rows.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");

      // Fusionner lignes spécifiques
      if (
        row[0] &&
        (row[0].startsWith("J") || row[0].startsWith("MATCH") || row[0].startsWith("PRONOS") || row[0].includes("CLASSEMENT"))
      ) {
        const td = document.createElement("td");
        td.colSpan = 3;
        td.textContent = row[0];
        td.className = "section-header";
        tr.appendChild(td);
        table.appendChild(tr);
        return;
      }

      // Lignes normales
      row.forEach((cell, colIndex) => {
        const td = document.createElement("td");
        td.innerHTML = cell.replace(/\n/g, "<br>");
        tr.appendChild(td);
      });

      // Ajouter logos si ligne précédente est "MATCH X"
      if (
        rowIndex > 0 &&
        rows[rowIndex - 1][0] &&
        rows[rowIndex - 1][0].startsWith("MATCH")
      ) {
        const team1 = row[0]?.trim().toLowerCase();
        const team2 = row[2]?.trim().toLowerCase();

        const logo1 = document.createElement("img");
        logo1.src = `${logoBasePath}${team1}.png`;
        logo1.onerror = () => (logo1.style.display = "none");
        logo1.className = "team-logo";

        const logo2 = document.createElement("img");
        logo2.src = `${logoBasePath}${team2}.png`;
        logo2.onerror = () => (logo2.style.display = "none");
        logo2.className = "team-logo";

        tr.children[0].prepend(logo1);
        tr.children[2].appendChild(logo2);
      }

      table.appendChild(tr);
    });

    container.appendChild(table);

    // === TRAITEMENT MISSILES JOUES ===
    const missileTitleIndex = rows.findIndex(row => row[0] && row[0].toUpperCase().includes("MISSILES JOUES"));
    if (missileTitleIndex !== -1 && rows[missileTitleIndex + 1] && rows[missileTitleIndex + 1][0]) {
      const missileLines = rows[missileTitleIndex + 1][0].split('\n');

      missileLines.forEach(line => {
        const parts = line.trim().split(" ");
        if (parts.length !== 4) return;
        const [team1, team2, player, prono] = parts;

        const trs = table.querySelectorAll("tr");
        for (let i = 0; i < trs.length; i++) {
          const tds = trs[i].querySelectorAll("td");
          if (
            tds.length === 3 &&
            tds[0].textContent.trim() === team1 &&
            tds[2].textContent.trim() === team2
          ) {
            const headerRow = trs[i + 2];
            const pronoRow = trs[i + 3];
            if (!headerRow || !pronoRow) return;

            const headers = headerRow.querySelectorAll("td");
            const pronos = pronoRow.querySelectorAll("td");

            headers.forEach((cell, colIndex) => {
              if (cell.textContent.trim() === prono) {
                const targetCell = pronos[colIndex];
                if (targetCell) {
                  const lines = targetCell.innerHTML.split("<br>");
                  const updatedLines = lines.map(line => {
                    const cleanLine = line.replace(/ 🎯/g, "").trim();
                    if (cleanLine.startsWith(player)) {
                      return cleanLine + " 🎯";
                    }
                    return line;
                  });
                  targetCell.innerHTML = updatedLines.join("<br>");
                }
              }
            });
          }
        }
      });
    }
  });
