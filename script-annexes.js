const urlAnnexes = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=20526615&single=true&output=csv";

const container = document.getElementById("annexes-container");

Papa.parse(urlAnnexes, {
  download: true,
  complete: function(results) {
    const data = results.data;
    container.innerHTML = "";

    let table = null;

    data.forEach((row, i) => {
      const first = (row[0] ? String(row[0]).trim() : "");

      // === CAS DES MATCH-HEADERS ===
      if (
        first.toUpperCase().startsWith("STATISTIQUES") ||
        first === "CLASSEMENT LIGUE 1" ||
        first === "JOUEURS STARS DE LIGUE 1" ||
        first === "SUR LE TOIT DE L'EUROPE"
      ) {
        // Fermer le tableau précédent si besoin
        if (table) container.appendChild(table);

        // Nouveau tableau
        table = document.createElement("table");
        table.style.width = "100%";          // largeur 100% pour responsive
        table.style.tableLayout = "auto";    // colonnes auto
        table.style.whiteSpace = "nowrap";   // éviter retour ligne

        // Ligne header
        const tr = document.createElement("tr");
        tr.classList.add("match-header");

        const td = document.createElement("td");
        td.textContent = first;

        // Gestion des colSpan spécifiques
        if (first === "CLASSEMENT LIGUE 1") td.colSpan = 4;
        else if (first === "JOUEURS STARS DE LIGUE 1") td.colSpan = 3;
        else if (first === "SUR LE TOIT DE L'EUROPE") td.colSpan = 3;
        else td.colSpan = row.length; // fallback

        tr.appendChild(td);
        table.appendChild(tr);

        return; // on passe à la ligne suivante
      }

      if (!table) {
        // sécurité : créer un tableau s’il n’y en a pas encore
        table = document.createElement("table");
        table.style.width = "100%";
        table.style.tableLayout = "auto";
        table.style.whiteSpace = "nowrap";
      }

      // === Lignes normales ===
      const cleanedRow = [...row];
      const tr = document.createElement("tr");

      cleanedRow.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        td.style.whiteSpace = "nowrap";
        td.style.padding = "4px 8px";
        tr.appendChild(td);
      });

      table.appendChild(tr);
    });

    // Fermer le dernier tableau
    if (table) container.appendChild(table);
  }
});
