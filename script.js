const logoFolder = 'images/'; // dossier des logos
const logoExt = '.png';       // extension des fichiers logos

function getLogoHTML(teamName) {
  if (!teamName) return '';
  const cleanName = teamName.trim().toLowerCase();

  const imgHTML = `<img src="${logoFolder}${cleanName}${logoExt}" alt="${cleanName}" style="height:20px; vertical-align:middle; margin-right:5px;">`;

  return imgHTML + teamName.trim();
}

function createTable(data) {
  let html = '<table><tbody>';

  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    // fusion première ligne "J01"
    if (i === 0) {
      html += `<tr><td colspan="3" class="journee">${row[0]}</td></tr>`;
      continue;
    }
    
    // fusion ligne MATCH X
    if (row[0].startsWith('MATCH')) {
      html += `<tr><td colspan="3" class="match">${row[0]}</td></tr>`;
      continue;
    }

    // fusion ligne PRONOS
    if (row[0] === 'Pronos') {
      html += `<tr><td colspan="3" class="pronos">${row[0]}</td></tr>`;
      continue;
    }

    html += '<tr>';

    for (let col = 0; col < 3; col++) {
      let cell = row[col] || '';

      // si ligne de noms/pronos, on formate les retours à la ligne sur les joueurs
      if (i > 3 && col === 0 && (cell.includes('(') || cell.match(/[A-Za-z]/))) {
        // découpage par joueur (ex: Jo (1pt))
        let joueurs = cell.split(/(?<=\))\s*/); // split après ")"
        if (joueurs.length === 1) {
          // pas de point, on split par espace ou virgule
          joueurs = cell.split(/[,;]/);
          joueurs = joueurs.map(j => j.trim()).filter(Boolean);
        }
        cell = joueurs.map(j => j.trim()).join('<br>');
      }
      if (i > 3 && (col === 0 || col === 1 || col === 2)) {
        // ajoute logos équipes dans colonnes équipe (col 0 et 2)
        if (col === 0 || col === 2) {
          cell = getLogoHTML(cell);
        }
      }

      html += `<td>${cell}</td>`;
    }
    html += '</tr>';
  }

  html += '</tbody></table>';
  return html;
}

// fonction de chargement et affichage
function loadData(data) {
  console.log('Données CSV chargées :', data);
  const tableHtml = createTable(data);
  document.getElementById('output').innerHTML = tableHtml;
}
