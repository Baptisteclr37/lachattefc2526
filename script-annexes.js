const urlAnnexes = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=20526615&single=true&output=csv";

const container = document.getElementById("annexes-container");

Papa.parse(urlAnnexes, {
  download: true,
  complete: function(results) {
    const data = results.data;
    container.innerHTML = "";

    let table = null;
    let currentStatType = "";

    data.forEach((row, i) => {
      // Cast sûr en string pour éviter erreurs
      const first = (row[0] ? String(row[0]).toUpperCase().trim() : "");

      // === DÉBUT D’UNE NOUVELLE SECTION STATISTIQUES ===
      if (first.startsWith("STATISTIQUES")) {
        // Fermer le tableau précédent si besoin
        if (table) container.appendChild(table);

        table = document.createElement("table");
        table.style.tableLayout = "auto";
        table.style.width = "auto"; // largeur auto
        table.style.whiteSpace = "nowrap"; // éviter retours à la ligne

        // Ligne STATISTIQUES fusionnée
        const tr = document.createElement("tr");
        tr.classList.add("match-header"); // toute la ligne
        const td = document.createElement("td");
        td.colSpan = row.length;
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
        table.style.tableLayout = "auto";
        table.style.width = "auto";
        table.style.whiteSpace = "nowrap";
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
        td.style.whiteSpace = "nowrap"; // empêcher retour à la ligne
        td.style.padding = "4px 8px";   // petit confort visuel

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
