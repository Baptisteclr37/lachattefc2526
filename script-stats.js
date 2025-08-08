const urlStats = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=473833868&single=true&output=csv";

const container = document.getElementById("stats-container");

Papa.parse(urlStats, {
  download: true,
  complete: function(results) {
    const data = results.data;
    container.innerHTML = "";

    let table = null;

    data.forEach((row, i) => {
      const first = row[0]?.toUpperCase?.().trim() || "";

      // Début d'une section STATISTIQUES
      if (first.startsWith("STATISTIQUES")) {
        // Fermer le tableau courant si besoin
        if (table) container.appendChild(table);

        table = document.createElement("table");

        // Créer la ligne fusionnée
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = row.length;
        td.className = "match-header";
        td.textContent = row[0];
        tr.appendChild(td);
        table.appendChild(tr);

        // Préparer que la ligne suivante soit en style pronos-header
        results.data[i + 1] && results.data[i + 1][0] !== undefined
          ? (results.data[i + 1].__pronostype = true)
          : null;

        return;
      }

      if (!table) {
        table = document.createElement("table");
      }

      const tr = document.createElement("tr");

      row.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });

      // Appliquer le style pronos-header si flag posé
      if (row.__pronostype) {
        tr.classList.add("pronos-header");
        delete row.__pronostype;
      }

      table.appendChild(tr);
    });

    // Ferme le dernier tableau affiché
    if (table) container.appendChild(table);
  }
});










