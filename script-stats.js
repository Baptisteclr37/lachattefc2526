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

    // 🔥 Ajout des couleurs et pictos rangs
    colorerClassementAvecRangs();
  }
});

function colorerClassementAvecRangs() {
  const lignes = document.querySelectorAll("#classement-container table tr:not(:first-child)");
  if (!lignes.length) return;

  let rangsTrouvés = new Set();

  // 1️⃣ Récupération des rangs présents
  lignes.forEach(row => {
    const rangCell = row.children[0];
    const rang = parseInt(rangCell.textContent.trim());
    if (!isNaN(rang)) {
      rangsTrouvés.add(rang);
    }
  });

  const rangsTries = Array.from(rangsTrouvés).sort((a, b) => a - b);
  const top1 = rangsTries[0];
  const top2 = rangsTries[1];
  const top3 = rangsTries[2];
  const last = rangsTries[rangsTries.length - 1];

  // 2️⃣ Application des styles et emojis
  lignes.forEach(row => {
    const rangCell = row.children[0];
    const rang = parseInt(rangCell.textContent.trim());
    if (isNaN(rang)) return;

    let picto = "";

    if (rang === top1) {
      row.classList.add("top1");
      picto = "🥇";
    } else if (rang === top2) {
      row.classList.add("top2");
      picto = "🥈";
    } else if (rang === top3) {
      row.classList.add("top3");
      picto = "🥉";
    } else if (rang === last) {
      row.classList.add("last");
      picto = "💩";
    }

  
  });

}

