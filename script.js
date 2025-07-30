document.addEventListener("DOMContentLoaded", () => {
  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");
      const baseImagePath = "/lachattefc2526/images/";

      data.forEach((row, i) => {
        const tr = document.createElement("tr");

        // Ligne 0 : Titre J01 fusionnée
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

        row.forEach((cell, cellIndex) => {
          const td = document.createElement("td");

          // Ligne du score avec noms des équipes (ex : PSG 2 - 1 Lyon)
          const match = cell.match(/^(.+?)\s+(\d+\s*-\s*\d+)\s+(.+)$/);
          if (match) {
            const team1 = match[1].trim();
            const score = match[2].trim();
            const team2 = match[3].trim();

            const logo1 = `${baseImagePath}${team1.toLowerCase().replace(/\s/g, "-")}.png`;
            const logo2 = `${baseImagePath}${team2.toLowerCase().replace(/\s/g, "-")}.png`;
            console.log("LOGO 1", logo1);
console.log("LOGO 2", logo2);

            td.innerHTML = `
              <div class="match-row">
                <img src="${logo1}" alt="${team1}" class="team-logo"> ${team1}
                <strong style="margin: 0 8px;">${score}</strong>
                <img src="${logo2}" alt="${team2}" class="team-logo"> ${team2}
              </div>
            `;
            tr.appendChild(td);
            return;
          }

          // Joueurs avec points
          if (cell.includes("(")) {
            const items = cell.split(")").filter(x => x.trim() !== "");
            td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
          }
          // Joueurs sans points (plus d'un mot dans la cellule)
          else if (cell.trim().split(/\s+/).length > 1) {
            const noms = cell.trim().split(/\s+/);
            td.innerHTML = noms.map(n => n).join("<br>");
          } else {
            td.textContent = cell;
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
