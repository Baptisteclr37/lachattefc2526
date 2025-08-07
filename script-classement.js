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

    if (picto) {
      rangCell.innerHTML = `<span class="rang-picto">${picto}</span>${rang}`;
    }
  });
}
