const urlVueMatch = 'https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv';
const urlVueJoueur = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=1528731943&single=true&output=csv';

const container = document.getElementById('table-container');

// Bouton bascule
const toggleBtn = document.createElement('button');
toggleBtn.id = 'toggleViewBtn';
toggleBtn.textContent = 'Passer à la vue par joueur';
toggleBtn.style.margin = '10px';
toggleBtn.style.padding = '8px 15px';
toggleBtn.style.fontSize = '16px';
toggleBtn.style.cursor = 'pointer';
container.parentNode.insertBefore(toggleBtn, container);

let isVueMatch = true;

const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

function createLogoCell(content) {
  const td = document.createElement("td");
  const teamName = content.trim();

  if (teamName) {
    const logoUrl = baseImagePath + teamName.toLowerCase().replace(/\s/g, "-") + ".png";
    const img = document.createElement("img");
    img.src = logoUrl;
    img.alt = teamName + " logo";
    img.className = "team-logo";

    td.style.textAlign = "center";
    td.appendChild(img);
    td.appendChild(document.createElement("br"));
    td.appendChild(document.createTextNode(teamName));
  } else {
    td.textContent = content;
  }

  return td;
}

function afficherVueJoueur() {
  container.innerHTML = '';
  container.textContent = 'Chargement des données…';

  Papa.parse(urlVueJoueur, {
    download: true,
    header: false,
    complete: function(results) {
      const data = results.data;
      let html = '<table border="1" cellspacing="0" cellpadding="5">';
      const joueurs = ["KMEL", "SIM", "MAT", "TIBO", "JO", "BATIST", "KRIM", "RAF", "JEREM", "JUZ", "MAX", "GERALD", "NICO", "THOMAS"];
      let inTeamBlock = false;
      let teamBlockCounter = 0;

      data.forEach((row) => {
        html += '<tr>';
        const firstCell = row[0];

        if (firstCell === 'J01') {
          html += '<td colspan="5" class="journee-header">' + firstCell + '</td>';
          for (let i = 5; i < row.length; i++) {
            html += '<td>' + row[i] + '</td>';
            } 
          } else if(firstCell === 'VUE PAR JOUEUR') {
          html += '<td colspan="5" class="classement-journee-header">' + firstCell + '</td>';
          for (let i = 5; i < row.length; i++) {
            html += '<td>' + row[i] + '</td>';
 }
        } else if (firstCell === 'Equipe Dom.') {
          inTeamBlock = true;
          teamBlockCounter = 0;
          row.forEach(cell => {
            html += '<td class="pronos-header">' + cell + '</td>';
          });

        } else if (joueurs.includes(firstCell)) {
          html += '<td colspan="5" class="match-header">' + firstCell + '</td>';
          for (let i = 5; i < row.length; i++) {
            html += '<td>' + row[i] + '</td>';
          }

        } else {
          row.forEach((cell, colIndex) => {
            let td;

            if (inTeamBlock && teamBlockCounter < 10 && (colIndex === 0 || colIndex === 2)) {
              td = createLogoCell(cell);
              html += td.outerHTML;
            } else {
              td = document.createElement("td");

              if (cell.includes("(")) {
                const items = cell.split(")").filter(x => x.trim() !== "");
                td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
              } else if (cell.trim().split(/\s+/).length > 1) {
                td.innerHTML = cell.trim().split(/\s+/).join("<br>");
              } else {
                td.textContent = cell;
              }

              html += td.outerHTML;
            }
          });

          if (inTeamBlock && teamBlockCounter < 10) {
            teamBlockCounter++;
            if (teamBlockCounter >= 10) {
              inTeamBlock = false;
            }
          }
        }

        html += '</tr>';
      });

      html += '</table>';
      container.innerHTML = html;
    },
    error: function(err) {
      container.textContent = 'Erreur de chargement : ' + err.message;
    }
  });
}

function afficherVueMatch() {
  container.innerHTML = ''; // nettoie le conteneur AVANT d’afficher “chargement”
  container.textContent = 'Chargement des données…';

  Papa.parse(urlVueMatch, {
    download: true,
    complete: function(results) {
      const data = results.data;
      const table = document.createElement("table");
      let lastLineWasMatch = false;
      const matchMap = new Map();
      let skipNext = false;
      

       

      data.forEach((row, i) => {
        if (skipNext) {
          skipNext = false;
          return;
        }

        const tr = document.createElement("tr");

     


        if (row[0]?.toUpperCase().startsWith("MATCH")) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "match-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          lastLineWasMatch = true;
          return;
        }

          if (row[0]?.toUpperCase().startsWith("📅")) {
            console.log("row[0] =", row[0]);
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          lastLineWasMatch = true;
          return;
        }

        if (row[0]?.toUpperCase() === "PRONOS") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "pronos-header";
          td.textContent = "PRONOS";
          tr.appendChild(td);
          table.appendChild(tr);
          lastLineWasMatch = false;
          return;
        }

        if (row[0]?.toUpperCase() === "🥇🥈🥉 CLASSEMENT JOURNEE") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee-header";
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);
          return;
        }

        if (i > 0 && data[i - 1][0]?.toUpperCase() === "🥇🥈🥉 CLASSEMENT JOURNEE") {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.className = "classement-journee";
          let classementArray = (row[0] || "").split(/\r?\n/).filter(x => x.trim());

          if (classementArray.length === 1) {
            classementArray = row[0].split(/\s{2,}/).filter(x => x.trim());
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

        if (["MISSILES JOUES", "JACKPOT JOUES", "DOUBLE CHANCE JOUES" ].includes(row[0]?.toUpperCase())) {
          const td = document.createElement("td");
          td.colSpan = 3;
          td.textContent = row[0];
          tr.appendChild(td);
          table.appendChild(tr);

          if (data[i + 1]) {
            const trNext = document.createElement("tr");
            const tdNext = document.createElement("td");
            tdNext.colSpan = 3;
            tdNext.textContent = data[i + 1][0] || "";
            trNext.appendChild(tdNext);
            table.appendChild(trNext);
            skipNext = true;
          }
          return;
        }

        // ... [tout ton code de construction de ligne est inchangé ici] ...

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
              const items = cell.split(")").filter(x => x.trim());
              td.innerHTML = items.map(x => x.trim() + ")").join("<br>");
            } else if (cell.trim().split(/\s+/).length > 1) {
              td.innerHTML = cell.trim().split(/\s+/).join("<br>");
            } else {
              td.textContent = cell;
            }
          }

          tr.appendChild(td);
        });

        table.appendChild(tr);

        if (data[i - 1]?.[0]?.toUpperCase() === "PRONOS") {
          const team1 = data[i - 3]?.[0]?.trim() || "";
          const team2 = data[i - 3]?.[2]?.trim() || "";
          const key = team1 + "___" + team2;
          matchMap.set(key, tr);
        }

        if (lastLineWasMatch) lastLineWasMatch = false;
      });

      // 👉 Ajout du tableau
      container.innerHTML = ''; // Efface le "Chargement des données…" avant d'afficher
      container.appendChild(table);

      const rows = document.querySelectorAll("table tr");

rows.forEach((tr, i) => {
  const firstCell = tr.cells[0]?.textContent.trim();
  
  // On cherche les lignes MATCH (1 à 9)
  if (/^MATCH\s[1-9]$/.test(firstCell)) {
    const resultRow = rows[i + 1];
    const resultCell = resultRow.cells[1]; // cellule centrale (entre col0 et col2)
    if (!resultCell) return;

    const resultValue = resultCell.textContent.trim();
    if (!["1", "N", "2"].includes(resultValue)) return;

    // Ligne des pronostics (2 lignes plus bas que celle avec le résultat)
    const pronosRow = rows[i + 3];
    if (!pronosRow) return;

    for (let c = 0; c < 3; c++) {
      if (pronosRow.cells[c]?.textContent.trim() === resultValue) {
        pronosRow.cells[c].style.backgroundColor = "#31823c"; // vert doux
      }
    }
  }
});



      // 🎯 Marquage des missiles
      function markMissiles() {
        const missilesRowIndex = data.findIndex(row => row[0]?.toUpperCase() === "MISSILES JOUES");
        if (missilesRowIndex === -1) return;

        const missilesText = data[missilesRowIndex + 1]?.[0];
        if (!missilesText) return;

        const missiles = missilesText.split(/\r?\n/).filter(x => x.trim()).map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length < 4) return null;
          return {
            equipeDom: parts[0],
            equipeExt: parts[1],
            joueur: parts[2],
            prono: parts[3],
          };
        }).filter(Boolean);

        const trs = table.querySelectorAll("tr");

        missiles.forEach(({ equipeDom, equipeExt, joueur, prono }) => {
          let foundLineIndex = -1;
          for (let i = 0; i < trs.length; i++) {
            const td = trs[i].querySelector("td");
            if (!td) continue;
            const span = td.querySelector("span");
            const text = span ? span.textContent.trim() : td.textContent.trim();
            if (text === equipeDom) {
              foundLineIndex = i;
              break;
            }
          }

          if (foundLineIndex === -1) return;

          const joueursRow = trs[foundLineIndex + 3];
          if (!joueursRow) return;

          const joueurTd = joueursRow.querySelectorAll("td")[0];
          if (!joueurTd) return;

          const currentHTML = joueurTd.innerHTML;
          const updatedHTML = currentHTML
            .split(/<br\s*\/?>/i)
            .map(line => {
              const cleanLine = line.replace(/🎯/g, "").trim();
              const nameOnly = cleanLine.replace(/\s*\(\d+ ?pts?\)/i, "").trim();
              return nameOnly === joueur ? `🎯 ${cleanLine}` : line;
            })
            .join("<br>");

          joueurTd.innerHTML = updatedHTML;
        });

        // Masquer les deux lignes affichées
        const rows = table.querySelectorAll("tr");
        let visibleIndex = 0;
        for (let i = 0; i < rows.length; i++) {
          const rowText = rows[i].textContent.toUpperCase().trim();
          if (visibleIndex === missilesRowIndex || visibleIndex === missilesRowIndex + 1) {
            rows[i].style.display = "none";
          }
          if (!rows[i].hasAttribute('data-hidden')) {
            visibleIndex++;
          }
        }
      }





// 🎰 Marquage des jackpots
function markJackpots() {
  const jackpotRowIndex = data.findIndex(row => row[0]?.toUpperCase() === "JACKPOT JOUES");
  console.log("🔍 Jackpot row index:", jackpotRowIndex);

  if (jackpotRowIndex === -1) {
    console.warn("❌ Ligne 'JACKPOT JOUES' non trouvée");
    return;
  }

  const jackpotText = data[jackpotRowIndex + 1]?.[0];
  console.log("🎰 Texte jackpot brut :", jackpotText);

  if (!jackpotText) {
    console.warn("❌ Aucun texte dans la ligne jackpot");
    return;
  }

  const jackpots = jackpotText.split(/\r?\n/).filter(x => x.trim()).map(line => {
    const parts = line.trim().split(/\s+/);
    console.log("🔹 Ligne jackpot analysée :", parts);
    if (parts.length < 4) return null;
    return {
      equipeDom: parts[0],
      equipeExt: parts[1],
      joueur: parts[2],
      prono: parts[3],
    };
  }).filter(Boolean);

  console.log("✅ Jackpots parsés :", jackpots);

  const trs = table.querySelectorAll("tr");

  jackpots.forEach(({ equipeDom, equipeExt, joueur, prono }) => {
    console.log(`🎯 Recherche du match pour ${equipeDom} - ${equipeExt}`);

    let foundLineIndex = -1;
    for (let i = 0; i < trs.length; i++) {
      const td = trs[i].querySelector("td");
      if (!td) continue;

      const hasLogo = td.querySelector("img");
      const text = td.textContent.trim();

      if (hasLogo && text === equipeDom) {
        foundLineIndex = i;
        break;
      }
    }

    console.log(`🔎 Match trouvé à la ligne : ${foundLineIndex}`);
    if (foundLineIndex === -1) {
      console.warn(`❌ Match non trouvé pour ${equipeDom}`);
      return;
    }

    const joueursRow = trs[foundLineIndex + 3];
    if (!joueursRow) {
      console.warn(`❌ Pas de ligne joueurs à l'index ${foundLineIndex + 3}`);
      return;
    }

    const joueurTds = joueursRow.querySelectorAll("td");
if (!joueurTds.length) return;

joueurTds.forEach(td => {
  const currentHTML = td.innerHTML;
  const updatedHTML = currentHTML
    .split(/<br\s*\/?>/i)
    .map(line => {
      const cleanLine = line.trim();
      const nameOnly = cleanLine.replace(/\s*\(.*?\)/, "").replace(/🎯|🎰/g, "").trim();
      if (nameOnly === joueur) {
        console.log(`🎰 Jackpot appliqué à ${joueur}`);
        if (line.includes("🎯")) {
          return line.replace("🎯", "🎰🎯");
        } else if (!line.includes("🎰")) {
          return `🎰 ${line}`;
        }
      }
      return line;
    })
    .join("<br>");
  td.innerHTML = updatedHTML;
});

   // console.log("✅ HTML après modif :", joueurTd.innerHTML);
  });

  // Masquer les deux lignes visibles
  const rows = table.querySelectorAll("tr");
  let visibleIndex = 0;
  for (let i = 0; i < rows.length; i++) {
    const rowText = rows[i].textContent.toUpperCase().trim();
    if (visibleIndex === jackpotRowIndex || visibleIndex === jackpotRowIndex + 1) {
      rows[i].style.display = "none";
    }
    if (!rows[i].hasAttribute('data-hidden')) {
      visibleIndex++;
    }
  }

  console.log("🎉 Jackpot processing terminé.");
}




// 2️⃣ Marquage des Double chance
function markDouble() {
  const DoubleRowIndex = data.findIndex(row => row[0]?.toUpperCase() === "DOUBLE CHANCE JOUES");
  console.log("🔍 Double row index:", DoubleRowIndex);

  if (DoubleRowIndex === -1) {
    console.warn("❌ Ligne 'DOUBLE CHANCE JOUES' non trouvée");
    return;
  }

  const DoubleText = data[DoubleRowIndex + 1]?.[0];
  console.log("2️⃣ Texte Double brut :", DoubleText);

  if (!DoubleText) {
    console.warn("❌ Aucun texte dans la ligne Double Chance");
    return;
  }

  const Double = DoubleText.split(/\r?\n/).filter(x => x.trim()).map(line => {
    const parts = line.trim().split(/\s+/);
    console.log("🔹 Ligne Double analysée :", parts);
    if (parts.length < 4) return null;
    return {
      equipeDom: parts[0],
      equipeExt: parts[1],
      joueur: parts[2],
      prono: parts[3],
    };
  }).filter(Boolean);

  console.log("✅ Double parsés :", Double);

  const trs = table.querySelectorAll("tr");

  Double.forEach(({ equipeDom, equipeExt, joueur, prono }) => {
    console.log(`2️⃣ Recherche du match pour ${equipeDom} - ${equipeExt}`);

    let foundLineIndex = -1;
    for (let i = 0; i < trs.length; i++) {
      const td = trs[i].querySelector("td");
      if (!td) continue;

      const hasLogo = td.querySelector("img");
      const text = td.textContent.trim();

      if (hasLogo && text === equipeDom) {
        foundLineIndex = i;
        break;
      }
    }

    console.log(`🔎 Match trouvé à la ligne : ${foundLineIndex}`);
    if (foundLineIndex === -1) {
      console.warn(`❌ Match non trouvé pour ${equipeDom}`);
      return;
    }

    const joueursRow = trs[foundLineIndex + 3];
    if (!joueursRow) {
      console.warn(`❌ Pas de ligne joueurs à l'index ${foundLineIndex + 3}`);
      return;
    }

    const joueurTds = joueursRow.querySelectorAll("td");
if (!joueurTds.length) return;

joueurTds.forEach(td => {
  const currentHTML = td.innerHTML;
  const updatedHTML = currentHTML
    .split(/<br\s*\/?>/i)
    .map(line => {
      const cleanLine = line.trim();
     const nameOnly = cleanLine.replace(/\s*\(.*?\)/, "").replace(/2️⃣|🎯|🎰/g, "").trim();

      if (nameOnly === joueur) {
        console.log(`2️⃣ Double appliqué à ${joueur}`);
       if (line.includes("🎯")) {
    return line.replace("🎯", "2️⃣🎯");
} else if (line.includes("🎰🎯")) {
    return line.replace("🎰🎯", "2️⃣🎰🎯");
} else if (line.includes("🎰")) {
    return line.replace("🎰", "2️⃣🎰");
}	

        else if (!line.includes("2️⃣")) {
          return `2️⃣ ${line}`;
        }
      }
      return line;
    })
    .join("<br>");
  td.innerHTML = updatedHTML;
});

   // console.log("✅ HTML après modif :", joueurTd.innerHTML);
  });

  // Masquer les deux lignes visibles
  const rows = table.querySelectorAll("tr");
  let visibleIndex = 0;
  for (let i = 0; i < rows.length; i++) {
    const rowText = rows[i].textContent.toUpperCase().trim();
    if (visibleIndex === DoubleRowIndex || visibleIndex === DoubleRowIndex + 1) {
      rows[i].style.display = "none";
    }
    if (!rows[i].hasAttribute('data-hidden')) {
      visibleIndex++;
    }
  }

  console.log("🎉 Jackpot processing terminé.");
}
// Marquage de la Fonction surprise

function markSurpriseLines() {
  console.log("🔍 Lancement de markSurpriseLines");

  const lignes = Array.from(document.querySelectorAll("tr"));
  console.log(`🔎 Total lignes trouvées : ${lignes.length}`);

  lignes.forEach((ligne, index) => {
    if (!ligne.textContent.toUpperCase().includes("PRONOS")) return;

    console.log(`📍 Ligne PRONOS détectée à l'index ${index}`);

    const ligneJoueurs = lignes[index + 2];
    if (!ligneJoueurs) {
      console.warn(`❌ Pas de ligne joueur à l’index ${index + 2}`);
      return;
    }

    const cellules = Array.from(ligneJoueurs.querySelectorAll("td"));
    if (cellules.length < 3) {
      console.warn(`❌ Moins de 3 colonnes à l'index ${index + 2}`);
      return;
    }

    // Étape 1 : compter les vrais joueurs par cellule
    const nbJoueursParCellule = cellules.map((cellule, i) => {
      const brut = cellule.innerHTML;
      const contenu = brut
        .replace(/<br\s*\/?>/gi, '\n')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l !== "" && l !== "#N/A");

      console.log(`📦 [PRONOS ${index}] Cellule ${i} : ${contenu.length} joueurs`, contenu);
      return contenu.length;
    });

    const totalJoueurs = nbJoueursParCellule.reduce((a, b) => a + b, 0);
    console.log(`📊 [PRONOS ${index}] Total joueurs détectés : ${totalJoueurs}`);

    if (totalJoueurs === 0) {
      console.warn(`⚠️ [PRONOS ${index}] Aucun joueur détecté`);
      return;
    }

    // Étape 2 : marquer les surprises
    cellules.forEach((cellule, colIndex) => {
      const nbJoueursCellule = nbJoueursParCellule[colIndex];
      const ratio = nbJoueursCellule / totalJoueurs;

      console.log(`📈 Cellule ${colIndex} = ${nbJoueursCellule}/${totalJoueurs} = ${ratio.toFixed(2)}`);

      if (nbJoueursCellule > 0 && ratio <= 0.25) {
        if (!cellule.innerHTML.includes("🕵🏻‍♂️SURPRIZ?")) {
          console.log(`🚨 SURPRISE ajoutée en cellule ${colIndex} (ligne ${index + 2})`);
          cellule.innerHTML = `<strong>🕵🏻‍♂️SURPRIZ?</strong><br><br>${cellule.innerHTML}`;
        } else {
          console.log(`🔁 SURPRISE déjà présente en cellule ${colIndex}`);
        }
      } 
      
      else {
        console.log(`✅ Pas de surprise en cellule ${colIndex}`);
      }
    });

  });

  console.log("✅ Fin de la fonction markSurpriseLines");
}





      
      markMissiles(); // 👉 Appel juste ici
      markJackpots(); // 👉 Appel juste après markMissiles
       markDouble(); // 👉 Appel juste après markMissiles
      markSurpriseLines(); // 👉 Appel juste après markMissiles
      
    },
    error: function(err) {
      container.textContent = 'Erreur de chargement : ' + err.message;
    }
  });


}

// Initialisation à la vue match
afficherVueMatch();

// Gestion du bouton toggle
toggleBtn.addEventListener('click', () => {
  isVueMatch = !isVueMatch;
  toggleBtn.textContent = isVueMatch ? 'Passer à la vue par joueur' : 'Passer à la vue par match';
  isVueMatch ? afficherVueMatch() : afficherVueJoueur();
});








