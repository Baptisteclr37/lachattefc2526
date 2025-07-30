const url = 'https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv';

Papa.parse(url, {
  download: true,
  header: false,
  complete: function(results) {
    const data = results.data;
    const output = document.getElementById('output');
    output.innerHTML = '';

    let currentTable = null;

    data.forEach((row, index) => {
      // Ignore les lignes vides
      if (row.length < 2 || (row[0] === "" && row[1] === "")) return;

      const firstCell = row[0].trim().toUpperCase();

      if (firstCell.startsWith("J0")) {
        const title = document.createElement("h2");
        title.textContent = row[0];
        output.appendChild(title);
      } else if (firstCell.startsWith("MATCH")) {
        currentTable = document.createElement("table");
        currentTable.classList.add("match-table");
        output.appendChild(currentTable);

        const matchHeader = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 3;
        cell.className = "match-title";
        cell.textContent = row[0];
        matchHeader.appendChild(cell);
        currentTable.appendChild(matchHeader);
      } else {
        const tr = document.createElement("tr");
        row.forEach(cellText => {
          const td = document.createElement("td");
          td.textContent = cellText;
          tr.appendChild(td);
        });
        if (currentTable) currentTable.appendChild(tr);
      }
    });
  },
  error: function(err) {
    document.getElementById("output").textContent = "Erreur : " + err.message;
    console.error("Erreur de chargement CSV :", err);
  }
});
