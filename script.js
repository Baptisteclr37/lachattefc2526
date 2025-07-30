const url = 'https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv';

Papa.parse(url, {
  download: true,
  header: false,
  complete: function(results) {
    const data = results.data;
    console.log("Données CSV chargées :", data);

    const output = document.getElementById("output");
    output.innerHTML = ''; // Clear previous content

    const table = document.createElement('table');
    table.className = 'styled-table';

    data.forEach((row) => {
      const tr = document.createElement('tr');

      // Ligne "MATCH X"
      if (row.length === 1 && row[0].startsWith('MATCH')) {
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = row[0];
        td.className = 'section-title';
        tr.appendChild(td);
      }

      // Ligne "Pronos"
      else if (row.length === 1 && row[0].toLowerCase().includes('pronos')) {
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = row[0];
        td.className = 'section-pronos';
        tr.appendChild(td);
      }

      // Ligne normale
      else {
        row.forEach(cell => {
          const td = document.createElement('td');

          if (typeof cell === 'string' && cell.match(/\(.+pt\)/)) {
            // Retours à la ligne après chaque joueur (Xpt)
            const lines = cell.split(/\)\s*/).filter(Boolean).map(line => line + ')');
            td.innerHTML = lines.map(line => `<div>${line}</div>`).join('');
          } else {
            td.textContent = cell;
          }

          tr.appendChild(td);
        });
      }

      table.appendChild(tr);
    });

    output.appendChild(table);
  },
  error: function(err) {
    document.getElementById("output").textContent = "Erreur : " + err.message;
    console.error(err);
  }
});
