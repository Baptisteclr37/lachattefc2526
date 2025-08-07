const urlClassement = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=1207802460&single=true&output=csv";

const container = document.getElementById("classement-container");

Papa.parse(urlClassement, {
  download: true,
  header: false,
  complete: function(results) {
    const data = results.data;
    if (!data || data.length === 0) {
      container.textContent = "❌ Classement indisponible.";
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

    container.innerHTML = ""; // nettoie le "chargement..."
    container.appendChild(table);
  }
});
