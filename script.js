const csvUrl = 'https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv';

Papa.parse(csvUrl, {
  download: true,
  complete: function(results) {
    const data = results.data;
    const container = document.getElementById("table-container");

    const table = document.createElement("table");

    data.forEach((row, rowIndex) => {
      if (row.length === 0 || (row.length === 1 && row[0] === "")) return;

      const tr = document.createElement("tr");

      if (row[0].toUpperCase().startsWith("MATCH")) {
        const td = document.createElement("td");
        td.textContent = row[0];
        td.colSpan = 3;
        td.classList.add("match-title");
        tr.appendChild(td);
        table.appendChild(tr);
        return;
      }

      if (row[0].toUpperCase().includes("PRONOS")) {
        const td = document.createElement("td");
        td.textContent = "PRONOS";
        td.colSpan = 3;
        td.classList.add("pronos-title");
        tr.appendChild(td);
        table.appendChild(tr);
        return;
      }

      row.slice(0, 3).forEach(cell => {
        const td = document.createElement("td");

        // For cells with players and points, format them line by line
        if (cell.includes("(")) {
          const parts = cell.split(/\s+/).filter(p => p.trim() !== "");
          const formatted = parts.join("\n");
          td.textContent = formatted;
        } else {
          td.textContent = cell;
        }

        tr.appendChild(td);
      });

      table.appendChild(tr);
    });

    container.innerHTML = "";
    container.appendChild(table);
  },
  error: function(err) {
    document.getElementById("table-container").textContent = "Erreur : " + err.message;
  }
});
