document.addEventListener("DOMContentLoaded", () => {
  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");
      const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

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

        // Ligne MATCH 1, MATCH 2...
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

        // Lignes normales (3 colonnes)
        row.forEach((cell, index) => {
          const td = document.createElement("td");

          // Pour la colonne 0 (équipe domicile) et colonne 2 (équipe extérieur), insérer logo + texte
          if (index === 0 || index === 2) {
            const teamName = cell.trim();
            if (teamName) {
              const logoUrl = baseImagePath + teamName.toLowerCase().replace(/\s/g, "-") + ".png";
              console.log("Logo URL for team:", teamName, "=>", logoUrl);
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
          }
          else {
            // Si cellule contient des "(Xpt)"
            if (cell.includes("(")) {
              const items = cell.split(")").filter(x => x.trim() !== "");
              td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
            }
            // Si cellule contient plusieurs noms sans parenthèse
            else if (cell.trim().split(/\s+/).length > 1) {
              const noms = cell.trim().split(/\s+/);
              td.innerHTML = noms.map(n => n).join("<br>");
            }
            else {
              td.textContent = cell;
            }
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
