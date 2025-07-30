document.addEventListener("DOMContentLoaded", () => {
  const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");

      let lastLineWasMatch = false; // Variable pour savoir si la ligne précédente était MATCH X

      data.forEach((row, i) => {
        const tr = document.createElement("tr");

        // Ligne 0 : Titre J01 fusionné
        if (i === 0 && row[0]) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        // Ligne MATCH 1, MATCH 2...
        if (row[0] && row[0].toUpperCase().startsWith("MATCH")) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "match-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);

          lastLineWasMatch = true; // on se rappelle qu'on vient d'avoir une ligne MATCH
          return;
        }

        // Ligne PRONOS
        if (row[0] && row[0].toUpperCase() === "PRONOS") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "pronos-header";
          td.textContent = "PRONOS";
          tr.appendChild(td);
          table.appendChild(tr);

          lastLineWasMatch = false; // reset, on n'affiche pas les logos après
          return;
        }




        

        // Ligne CLASSEMENT JOURNEE fusionnée sur 3 colonnes avec style
  if (row[0] && row[0].toUpperCase() === "CLASSEMENT JOURNEE") {
    const td = document.createElement("td");
    td.colSpan = 3;
    td.className = "classement-journee-header"; // à styliser en CSS
    td.textContent = row[0];
    tr.appendChild(td);
    table.appendChild(tr);
    return;
  }

  // Ligne contenant le classement de la journée à trier et fusionner
  // On suppose qu’elle suit directement la ligne CLASSEMENT JOURNEE
  // Par exemple on peut vérifier que la ligne précédente est CLASSEMENT JOURNEE
  if (i > 0 && data[i-1][0] && data[i-1][0].toUpperCase() === "CLASSEMENT JOURNEE") {
    const td = document.createElement("td");
    td.colSpan = 3;
    td.className = "classement-journee"; // à styliser en CSS

    // La chaîne du classement complet
    const classementRaw = row[0] || "";

    // On split par retour à la ligne ou espace, ou en supposant que chaque joueur est séparé par un retour à la ligne
    // Si tout est sur une seule chaîne, on peut splitter sur \n ou .split(/\r?\n/)
    // Ici on suppose que c’est séparé par retour à la ligne ou par espaces (à adapter selon le CSV)
    // Exemple: "2. Kmel 10,50€\n8. Sim 0,00€\n..."

    // Remplacer les retours à la ligne explicites (si CSV sur une cellule)
    let classementArray = classementRaw.split(/\r?\n/).filter(x => x.trim() !== "");
    if (classementArray.length === 1) {
      // Peut-être séparés par espaces ou autre séparateur ?
      classementArray = classementRaw.split(/\s{2,}/).filter(x => x.trim() !== "");
    }

    // Trier par numéro avant le point
    classementArray.sort((a, b) => {
      const numA = parseInt(a.trim().split(".")[0]) || 9999;
      const numB = parseInt(b.trim().split(".")[0]) || 9999;
      return numA - numB;
    });

    // Reconstruire la chaîne avec retour à la ligne HTML
    td.innerHTML = classementArray.join("<br>");

    tr.appendChild(td);
    table.appendChild(tr);
    return;
  }




        

        // Pour les autres lignes
        row.forEach((cell, index) => {
          const td = document.createElement("td");

          // Si la ligne suit juste une ligne MATCH, on met les logos sur colonnes 0 et 2
          if (lastLineWasMatch && (index === 0 || index === 2)) {
            const teamName = cell.trim();
            if (teamName) {
              const logoUrl = baseImagePath + teamName.toLowerCase().replace(/\s/g, "-") + ".png";

              const img = document.createElement("img");
              img.src = logoUrl;
              img.alt = teamName + " logo";
              img.className = "team-logo";
              td.appendChild(img);

              const span = document.createElement("span");
              span.textContent = " " + teamName;
              td.appendChild(span);
            } else {
              td.textContent = cell;
            }
          } else {
            // Sinon, texte normal avec retour à la ligne si besoin
            if (cell.includes("(")) {
              const items = cell.split(")").filter(x => x.trim() !== "");
              td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
            } else if (cell.trim().split(/\s+/).length > 1) {
              const noms = cell.trim().split(/\s+/);
              td.innerHTML = noms.map(n => n).join("<br>");
            } else {
              td.textContent = cell;
            }
          }

          tr.appendChild(td);
        });

        table.appendChild(tr);

        // Après avoir traité la ligne qui suit MATCH, on remet à false
        if (lastLineWasMatch) lastLineWasMatch = false;
      });

      const container = document.getElementById("table-container");
      container.innerHTML = "";
      container.appendChild(table);
    },
    error: function (err) {
      const container = document.getElementById("table-container");
      container.textContent = "Erreur : " + err.message;
    }
  });
});
