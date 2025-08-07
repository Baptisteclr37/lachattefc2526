const urlBonus = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=1165673648&single=true&output=csv";

const container = document.getElementById("bonus-container");

Papa.parse(urlBonus, {
  download: true,
  header: false,
  complete: function(results) {
    const data = results.data;
    if (!data || data.length === 0) {
      container.textContent = "❌ Bonus indisponible.";
      return;
    }

    const table = document.createElement("table");

    data.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");


row.forEach((cell, colIndex) => {
        const isFirstRow = rowIndex === 0;
        const isFirstCell = colIndex === 0;
        const isLastCell = colIndex === row.length - 1;

        let cellElement;

        // 💥 1ère cellule (coin haut gauche) : <td> sans bord
        if (isFirstRow && isFirstCell) {
          cellElement = document.createElement("td");
          cellElement.classList.add("no-border-top-left");
        }
        // 🔝 Première ligne (en-têtes) → <th>
        else if (isFirstRow) {
          cellElement = document.createElement("th");
          cellElement.classList.add("classement-header");
        }
        // 💬 Tout le reste
        else {
          cellElement = document.createElement("td");
        }

        // 🧱 Empêcher le texte de la dernière colonne de se replier
        if (isLastCell) {
          cellElement.style.whiteSpace = "nowrap";
          cellElement.style.minWidth = "80px";
        }

        cellElement.textContent = cell;
        tr.appendChild(cellElement);
      });

      table.appendChild(tr);
    });


      

    container.innerHTML = ""; // nettoie le "chargement..."
    container.appendChild(table);
  }
});


