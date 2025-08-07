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
    table.id = "bonus-table"; // IMPORTANT : ajoute l'ID pour le CSS et JS

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

    // --- Ajout des classes pour colonnes MISSILE, JACKPOT, DOUBLE CHANCE ---
    const headerCells = table.querySelectorAll("tr:first-child th");
    let missileIndex = -1, jackpotIndex = -1, doubleChanceIndex = -1;

    headerCells.forEach((th, i) => {
      const text = th.textContent.trim().toUpperCase();
      if (text === "MISSILE") missileIndex = i;
      else if (text === "JACKPOT") jackpotIndex = i;
      else if (text === "DOUBLE CHANCE") doubleChanceIndex = i;
    });

    // Ajout des classes sur les th
    if (missileIndex !== -1) headerCells[missileIndex].classList.add("missile");
    if (jackpotIndex !== -1) headerCells[jackpotIndex].classList.add("jackpot");
    if (doubleChanceIndex !== -1) headerCells[doubleChanceIndex].classList.add("doublechance");

    // Ajout des classes sur les td de chaque ligne (sauf 1ère ligne)
    const rows = table.querySelectorAll("tr:not(:first-child)");
    rows.forEach(tr => {
      const cells = tr.querySelectorAll("td");
      if (missileIndex !== -1 && cells[missileIndex]) cells[missileIndex].classList.add("missile");
      if (jackpotIndex !== -1 && cells[jackpotIndex]) cells[jackpotIndex].classList.add("jackpot");
      if (doubleChanceIndex !== -1 && cells[doubleChanceIndex]) cells[doubleChanceIndex].classList.add("doublechance");
    });
  }
});
