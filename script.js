document.addEventListener("DOMContentLoaded", () => {
  const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");

      let lastLineWasMatch = false;
      const matchMap = new Map(); // Pour retrouver les lignes de pronos par match

      let missileData = [];

      // Fonction de normalisation des noms d'équipe
      const normalize = str => str.trim().toLowerCase().replace(/\s+/g, "-");

      data.forEach((row, i) => {
        const tr = document.createElement("tr");

        if (i === 0 && row[0]) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        if (row[0] && row[0].toUpperCase().startsWith("MATCH")) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "match-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);

          lastLineWasMatch = true;
          return;
        }

        if (row[0] && row[0].toUpperCase() === "PRONOS") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "pronos-header";
          td.textContent = "PRONOS";
          tr.appendChild(td);
          table.appendChild(tr);

          lastLineWasMatch = false;
          return;
        }

        if (row[0] && row[0].toUpperCase() === "CLASSEMENT JOURNEE") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        if (i > 0 && data[i - 1][0] && data[i - 1][0].toUpperCase() === "CLASSEMENT JOURNEE") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee";

          let classementArray = (row[0] || "").split(/\r?\n/).filter(x => x.trim() !== "");
          if (classementArray.length === 1) {
            classementArray = row[0].split(/\s{2,}/).filter(x => x.trim() !== "");
          }

          classementArray.sort((a, b) => {
            const numA = parseInt(a.trim().split(".")[0]) || 9999;
            const numB = parseInt(b.trim().split(".")[0]) || 9999;
            return numA - numB;
          });

          td.innerHTML = classementArray.join("<br>");
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        // MISSILES JOUES : ignorer visuellement mais stocker la data
        if (row[0] && row[0].toUpperCase() === "MISSILES JOUES") return;
        if (i > 0 && data[i - 1][0] && data[i - 1][0].toUpperCase() === "MISSILES JOUES") {
          missileData = (row[0] || "").split(/\r?\n/).map(x => x.trim()).filter(x => x !== "");
          console.log("Missiles détectés :", missileData);
          return;
        }

        // Ligne avec logos après MATCH
        row.forEach((cell, index) => {
          const td = document.createElement("td");

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

        // Sauvegarde de ligne de pronostics après PRONOS
        if (data[i - 1] && data[i - 1][0] && data[i - 1][0].toUpperCase() === "PRONOS") {
          const team1Raw = data[i - 3]?.[0]?.trim() || "";
          const team2Raw = data[i - 3]?.[2]?.trim() || "";
          const team1 = normalize(team1Raw);
          const team2 = normalize(team2Raw);
          const key = team1 + "___" + team2;
          console.log(`Mapping prono ligne ${i} => clé : ${key}`);
          matchMap.set(key, tr);
        }

        if (lastLineWasMatch) lastLineWasMatch = false;
      });

      // Traitement missiles
      missileData.forEach(line => {
        console.log("Traitement missile ligne :", line);
        const parts = line.split(/\s+/);
        if(parts.length < 4){
          console.log("Ligne missile invalide, skip :", line);
          return;
        }
        let [team1Raw, team2Raw, joueur, prono] = parts;
        const team1 = normalize(team1Raw);
        const team2 = normalize(team2Raw);
        console.log({ team1Raw, team2Raw, team1, team2, joueur, prono });

        const key = team1 + "___" + team2;
        const pronoColIndex = { "1": 0, "N": 1, "2": 2 }[prono];
        if (pronoColIndex == null) {
          console.log("Prono invalide :", prono);
          return;
        }

        const pronosTr = matchMap.get(key);
        if (!pronosTr) {
          console.log("Match non trouvé dans matchMap :", key);
          return;
        }

        console.log("Pronos tr cells count:", pronosTr.children.length);
        for(let i=0; i<pronosTr.children.length; i++) {
          console.log(i, pronosTr.children[i].textContent);
        }

        const td = pronosTr.children[pronoColIndex];
        if (!td) {
          console.log("Colonne prono non trouvée pour index :", pronoColIndex);
          return;
        }

        const lines = td.innerHTML.split("<br>");
        lines.forEach(l => console.log(`Comparaison ligne prono: [${l}] vs joueur [${joueur}]`));
        const updatedLines = lines.map(line => {
          const cleanLine = line.replace("🎯", "").trim();
          if (cleanLine === joueur || cleanLine.startsWith(joueur + " ")) {
            return cleanLine + " 🎯";
          }
          return line;
        });
        td.innerHTML = updatedLines.join("<br>");
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
