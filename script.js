Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv", {
  download: true,
  complete: function(results) {
    const data = results.data;
    const container = document.getElementById("table-container");
    container.innerHTML = ""; // Vide le contenu initial "Chargement des données…"

    const table = document.createElement("table");
    container.appendChild(table);

    const matchMap = new Map(); // Clé = équipeDomicile___équipeExtérieure, valeur = ligne des pronos joueurs

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (row[0] && row[0].toUpperCase().startsWith("MATCH")) {
        const matchBlock = document.createElement("tbody");
        table.appendChild(matchBlock);

        // MATCH X
        const matchRow = document.createElement("tr");
        matchRow.innerHTML = `<td colspan="3" class="section-title">${row[0]}</td>`;
        matchBlock.appendChild(matchRow);

        // Équipes & score
        const teamRow = data[i + 1];
        const team1 = teamRow[0]?.trim().toLowerCase();
        const prono = teamRow[1];
        const team2 = teamRow[2]?.trim().toLowerCase();

        const teamRowEl = document.createElement("tr");
        teamRowEl.innerHTML = `
          <td><img src="images/${team1}.png" class="logo"> ${teamRow[0]}</td>
          <td class="score">${prono}</td>
          <td><img src="images/${team2}.png" class="logo"> ${teamRow[2]}</td>`;
        matchBlock.appendChild(teamRowEl);

        // PRONOS (titre)
        const pronoTitle = document.createElement("tr");
        pronoTitle.innerHTML = `
          <td class="prono-title">1</td>
          <td class="prono-title">N</td>
          <td class="prono-title">2</td>`;
        matchBlock.appendChild(pronoTitle);

        // PRONOS (joueurs)
        const pronoRow = document.createElement("tr");
        const pronoData = data[i + 3];
        pronoData.forEach(cell => {
          const cellEl = document.createElement("td");
          cellEl.innerHTML = cell.replace(/\n/g, "<br>");
          pronoRow.appendChild(cellEl);
        });
        matchBlock.appendChild(pronoRow);

        // On mappe la clé du match
        const matchKey = `${normalize(team1)}___${normalize(team2)}`;
        matchMap.set(matchKey, pronoRow);
      }
    }

    // MISSILES 🎯
    const missileStart = data.findIndex(row => row[0] === "MISSILES JOUES");
    if (missileStart !== -1 && data[missileStart + 1] && data[missileStart + 1][0]) {
      const missileLines = data[missileStart + 1][0].split("\n");

      console.log("Clés des matches détectées dans la table :");
      for (const key of matchMap.keys()) {
        console.log(key);
      }

      console.log("Clés des missiles :");
      missileLines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 4) return;
        const [team1, team2, joueur, prono] = parts;
        const key = `${normalize(team1)}___${normalize(team2)}`;
        console.log(key);

        const targetRow = matchMap.get(key);
        if (!targetRow) {
          console.warn(`Match introuvable pour missiles: ${key}`);
          return;
        }

        // Trouver la colonne du prono : 1 → col 0, N → col 1, 2 → col 2
        const pronoIndex = prono === "1" ? 0 : prono === "N" ? 1 : prono === "2" ? 2 : -1;
        if (pronoIndex === -1) return;

        const cell = targetRow.children[pronoIndex];
        if (!cell) return;

        const html = cell.innerHTML;
        const regex = new RegExp(`(${joueur}(?: \\(\\d+pt\\))?)`, "i");

        if (regex.test(html)) {
          cell.innerHTML = html.replace(regex, "$1 🎯");
        }
      });
    }
  }
});

// Fonction de normalisation (accents, majuscules, espaces)
function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}
