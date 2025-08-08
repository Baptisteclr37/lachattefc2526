const urlStats = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=473833868&single=true&output=csv";

const container = document.getElementById("stats-container");

Papa.parse(urlStats, {
  download: true,
  complete: function(results) {
    const data = results.data;
    container.innerHTML = "";

    let table = null;
    let currentStatType = "";

    data.forEach((row, i) => {
      const first = row[0]?.toUpperCase?.().trim() || "";

      // === DÉBUT D’UNE NOUVELLE SECTION STATISTIQUES ===
      if (first.startsWith("STATISTIQUES")) {
        // Fermer le tableau précédent si besoin
        if (table) container.appendChild(table);

        table = document.createElement("table");

        // Ligne STATISTIQUES fusionnée
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = row.length;
        td.className = "match-header";
        td.textContent = row[0];
        tr.appendChild(td);
        table.appendChild(tr);

        // Retenir le type de stat (pour logiques suivantes)
        currentStatType = first;

        // Ligne suivante (entêtes) sera stylisée
        results.data[i + 1] && (results.data[i + 1].__pronostype = true);

        return;
      }

      if (!table) {
        table = document.createElement("table");
      }

      // === Nettoyage : on supprime dernière colonne vide si nécessaire ===
      let cleanedRow = [...row];
      if (
        (currentStatType.includes("SCORES") ||
         currentStatType.includes("VICTOIRES") ||
         currentStatType.includes("GAINS")) &&
        row.length === 4 &&
        row[3].trim() === ""
      ) {
        cleanedRow = row.slice(0, 3); // retirer dernière colonne
      }

      const tr = document.createElement("tr");

      cleanedRow.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;

        // Pour le tableau STATISTIQUES DE CLASSEMENT : équilibrage
        if (currentStatType.includes("CLASSEMENT") && cleanedRow.length === 4) {
          td.style.width = "25%";
        }

        tr.appendChild(td);
      });

      // Ligne d'en-tête sous STATISTIQUES → style pronos-header
      if (row.__pronostype) {
  tr.querySelectorAll("td").forEach(td => {
    td.classList.add("pronos-header");
  });
  delete row.__pronostype;
}
      table.appendChild(tr);
    });

    // Fermer le dernier tableau
    if (table) container.appendChild(table);
  }
});













