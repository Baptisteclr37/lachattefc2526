const urlStats = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_0qjFwqt3Xka_KMzOQLUuUG-XD0Mu_I1XzHMHJXp0OELC-NwuTd98QPbfi-dAprOzb3r8iEUjAlCV/pub?gid=294855343&single=true&output=csv";

const container = document.getElementById("stats-container");

Papa.parse(urlStats, {
  download: true,
  header: false,
  complete: function(results) {
    const data = results.data;
    if (!data || data.length === 0) {
      container.textContent = "❌ Stats indisponible.";
      return;
    }

    const table = document.createElement("table");

    data.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const cellElement = rowIndex === 0 ? document.createElement("th") : document.createElement("td");
        cellElement.textContent = cell;
        tr.appendChild(cellElement);
      });
      table.appendChild(tr);
    });


    container.appendChild(table);

   
}})






