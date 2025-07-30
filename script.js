document.addEventListener("DOMContentLoaded", () => {
  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");

      data.forEach((row, i) => {
        const tr = document.createElement("tr");

        // Ligne 0 : Titre J01 fusionné
        if (i === 0 && row[0]) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        // Ligne MATCH X
        if (row[0] && row[0].toUpperCase().startsWith("MATCH")) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "match-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        // Ligne PRONOS
        if (row[0] && row[0].toUpperCase() === "PRONOS") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "pronos-header";
          td.textContent = "PRONOS";
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        // Ligne avec score (ex: Lyon 2 - 1 Nice)
        if (row[0] && row[0].match(/.+\d+\s*-\s*\d+.+/)) {
          row.forEach(cell => {
            const td = document.createElement("td");

            const match = cell.match(/^(.+?)\s*\d+\s*-\s*\d+\s*(.+)$/);
            if (match) {
              const team1 = match[1].trim();
              const team2 = match[2].trim();
              const logo1 = `images/${team1.toLowerCase().replace(/\s/g, "-")}.png`;
              const logo2 = `images/${team2.toLowerCase().replace(/\s/g, "-")}.png`;
              console.log("Team1:", team1, "Logo1:", logo1, "Team2:", team2, "Logo2:", logo2);

              td.innerHTML = `
                <div class="match-cell">
                  <img src="${logo1}" class="team-logo" alt="${team1} logo">
                  <span>${team1}</span>
                  <strong>${cell.match(/\d+\s*-\s*\d+/)[0]}</strong>
                  <span>${team2}</span>
                  <img src="${logo2}" class="team-logo" alt="${team2} logo">
                </div>`;
            } else {
              td.textContent = cell;
            }

            tr.appendChild(td);
          });

          table.appendChild(tr);
          return;
        }

        // Autres lignes (joueurs etc.)
        row.forEach((cell) => {
          const td = document.createElement("td");

         if (cell.includes("(")) {
  // Ex: "Tibo (2) Baptiste (1)"
  const items = cell.match(/[^()]+\(.*?\)/g);
  td.innerHTML = items ? items.map(x => x.trim()).join("<br>") : cell;
} else {
  // Ex: "Baptiste Tibo Raf"
  const noms = cell.trim().split(/\s+/);
  td.innerHTML = noms.map(n => n).join("<br>");
}


          tr.appendChild(td);
        });

        table.appendChild(tr);
      });

      const container = document.getElementById("table-container");
      container.innerHTML = "";
      container.appendChild(table);
    },
    error: function (err) {
      document.getElementById("table-container").textContent = "Erreur : " + err.message;
    }
  });
});
