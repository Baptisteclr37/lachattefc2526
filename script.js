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

        row.forEach((cell) => {
          const td = document.createElement("td");

          // Nettoyage de la cellule
const clean = cell.trim();

// Si cellule contient des "(Xpt)"
if (clean.includes("(")) {
  const items = clean.split(")").filter(x => x.trim() !== "");
  td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
}
// Si cellule contient plusieurs mots (avec ou sans points)
else if (clean.split(/\s+/).length > 1) {
  const mots = clean.split(/\s+/);
  td.innerHTML = mots.join("<br>");
} else {
  td.textContent = clean;
}


          tr.appendChild(td);
        });

        table.appendChild(tr);
      });

      const container = document.getElementById("output");
      container.innerHTML = "";
      container.appendChild(table);
    },
    error: function (err) {
      document.getElementById("output").textContent = "Erreur : " + err.message;
    }
  });
});
