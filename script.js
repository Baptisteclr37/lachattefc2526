document.addEventListener("DOMContentLoaded", () => {
  const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

  const url = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv";

  function normalizeKey(t1, t2) {
    return t1.trim().toLowerCase().replace(/\s+/g, "") + "___" + t2.trim().toLowerCase().replace(/\s+/g, "");
  }

  Papa.parse(url, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const table = document.createElement("table");

      const matchMap = new Map();
      let missileData = [];

      let currentMatchTeams = null;
      let skipNextLine = false;

      data.forEach((row, i) => {
        if (skipNextLine) {
          // Cette ligne est la ligne des équipes juste après "MATCH X"
          const team1 = (row[0] || "").trim();
          const team2 = (row[2] || "").trim();
          if (team1 && team2) {
            currentMatchTeams = { team1, team2 };
            // On ajoute une ligne d'équipes au tableau avec logos
            const trTeams = document.createElement("tr");

            // Col équipe domicile avec logo + nom
            const tdTeam1 = document.createElement("td");
            const img1 = document.createElement("img");
            img1.src = baseImagePath + team1.toLowerCase().replace(/\s+/g, "-") + ".png";
            img1.alt = team1 + " logo";
            img1.className = "team-logo";
            tdTeam1.appendChild(img1);
            const span1 = document.createElement("span");
            span1.textContent = " " + team1;
            tdTeam1.appendChild(span1);
            trTeams.appendChild(tdTeam1);

            // Col score ou vide (col 1)
            const tdScore = document.createElement("td");
            tdScore.textContent = row[1] || "";
            trTeams.appendChild(tdScore);

            // Col équipe extérieur avec logo + nom
            const tdTeam2 = document.createElement("td");
            const img2 = document.createElement("img");
            img2.src = baseImagePath + team2.toLowerCase().replace(/\s+/g, "-") + ".png";
            img2.alt = team2 + " logo";
            img2.className = "team-logo";
            tdTeam2.appendChild(img2);
            const span2 = document.createElement("span");
            span2.textContent = " " + team2;
            tdTeam2.appendChild(span2);
            trTeams.appendChild(tdTeam2);

            table.appendChild(trTeams);
          } else {
            currentMatchTeams = null;
          }
          skipNextLine = false;
          return; // on a traité la ligne d’équipes, on passe à la suivante
        }

        // Si la ligne commence par "MATCH", on active le skip pour la ligne suivante
        if (row[0] && row[0].toString().toUpperCase().startsWith("MATCH")) {
          // On peut aussi créer un header ligne match
          const trMatchHeader = document.createElement("tr");
          const tdMatchHeader = document.createElement("td");
          tdMatchHeader.colSpan = 3;
          tdMatchHeader.className = "match-header";
          tdMatchHeader.textContent = row[0];
          trMatchHeader.appendChild(tdMatchHeader);
          table.appendChild(trMatchHeader);

          skipNextLine = true;
          return;
        }

        // Ligne "PRONOS" = header pronos
        if (row[0] && row[0].toString().toUpperCase() === "PRONOS") {
          const trPronosHeader = document.createElement("tr");
          const tdPronosHeader = document.createElement("td");
          tdPronosHeader.colSpan = 3;
          tdPronosHeader.className = "pronos-header";
          tdPronosHeader.textContent = "PRONOS";
          trPronosHeader.appendChild(tdPronosHeader);
          table.appendChild(trPronosHeader);
          return;
        }

        // Ligne "CLASSEMENT JOURNEE" = header classement
        if (row[0] && row[0].toString().toUpperCase() === "CLASSEMENT JOURNEE") {
          const trClassementHeader = document.createElement("tr");
          const tdClassementHeader = document.createElement("td");
          tdClassementHeader.colSpan = 3;
          tdClassementHeader.className = "classement-journee-header";
          tdClassementHeader.textContent = row[0];
          trClassementHeader.appendChild(tdClassementHeader);
          table.appendChild(trClassementHeader);
          return;
        }

        // Ligne juste après "CLASSEMENT JOURNEE" = contenu classement
        if (i > 0 && data[i - 1][0]?.toString().toUpperCase() === "CLASSEMENT JOURNEE") {
          const trClassement = document.createElement("tr");
          const tdClassement = document.createElement("td");
          tdClassement.colSpan = 3;
          tdClassement.className = "classement-journee";

          let classementArray = (row[0] || "").split(/\r?\n/).filter(x => x.trim() !== "");
          if (classementArray.length === 1) {
            classementArray = row[0].split(/\s{2,}/).filter(x => x.trim() !== "");
          }
          classementArray.sort((a, b) => {
            const numA = parseInt(a.trim().split(".")[0]) || 9999;
            const numB = parseInt(b.trim().split(".")[0]) || 9999;
            return numA - numB;
          });
          tdClassement.innerHTML = classementArray.join("<br>");
          trClassement.appendChild(tdClassement);
          table.appendChild(trClassement);
          return;
        }

        // MISSILES JOUES : ignorer ligne header et stocker données ligne suivante
        if (row[0] && row[0].toString().toUpperCase() === "MISSILES JOUES") {
          // ligne suivante contiendra les missiles
          if (data[i + 1] && data[i + 1][0]) {
            missileData = data[i + 1][0].split(/\r?\n/).map(x => x.trim()).filter(x => x !== "");
          }
          return;
        }

        // Toutes les autres lignes = pronostics des joueurs
        if (!currentMatchTeams) {
          // Pas de match en cours, on ignore cette ligne
          return;
        }

        // Création ligne pronos
        const trPronos = document.createElement("tr");
        row.forEach(cell => {
          const td = document.createElement("td");
          td.textContent = cell;
          trPronos.appendChild(td);
        });

        // Sauvegarde dans matchMap avec clé normalisée
        const key = normalizeKey(currentMatchTeams.team1, currentMatchTeams.team2);
        matchMap.set(key, trPronos);

        table.appendChild(trPronos);
      });

      // LOG console pour débogage
      console.log("Clés des matches détectées dans la table :");
      for (const key of matchMap.keys()) {
        console.log(key);
      }

      console.log("Clés des missiles :");
      missileData.forEach(line => {
        const parts = line.split(/\s+/);
        if (parts.length < 4) return;
        const [team1, team2, joueur, prono] = parts;
        const key = normalizeKey(team1, team2);
        console.log(key);
      });

      // === TRAITEMENT MISSILES ===
      missileData.forEach(line => {
        const parts = line.split(/\s+/);
        if (parts.length < 4) return;
        const [team1, team2, joueur, prono] = parts;
        const key = normalizeKey(team1, team2);
        const pronoColIndex = { "1": 0, "N": 1, "2": 2 }[prono];
        if (pronoColIndex == null) return;

        const pronosTr = matchMap.get(key);
        if (!pronosTr) {
          console.warn("Match introuvable pour missiles:", key);
          return;
        }

        const td = pronosTr.children[pronoColIndex];
        if (!td) return;

        const lines = td.innerHTML.split("<br>");
        const updatedLines = lines.map(line => {
          const lineClean = line.replace("🎯", "").trim();
          const joueurSansPoints = joueur.trim();
          const joueurAvecPoints = joueurSansPoints + " ";
          if (lineClean === joueurSansPoints || lineClean.startsWith(joueurAvecPoints)) {
            return lineClean + " 🎯";
          }
          return line;
        });
        td.innerHTML = updatedLines.join("<br>");
      });

      // Affichage dans le container
      const container = document.getElementById("container");
      container.innerHTML = "";
      container.appendChild(table);
    },
    error: function (err) {
      console.error("Erreur PapaParse :", err);
    },
  });
});
