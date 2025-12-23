// =====================
// Script Boxing Day
// =====================

const urlBoxingDay = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=329510180&single=true&output=csv";
const container = document.getElementById('table-container');
const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

// Fonction utilitaire : créer cellule avec logo
function createLogoCell(content) {
    const td = document.createElement("td");
    const teamName = (content || "").trim();
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
        td.textContent = content || '';
    }
    return td;
}

// Fonction principale : afficher la vue Boxing Day
function afficherBoxingDay() {
    container.innerHTML = 'Chargement des données…';

    Papa.parse(urlBoxingDay, {
        download: true,
        complete: function(results) {
            const data = results.data;

            let tableFragment = document.createDocumentFragment();

            let classementHTML = "";
            let currentMatch = null;
            let matchCount = 0;

            data.forEach((row) => {
                if (!row || row.length === 0) return;

                const firstCell = (row[0] || '').trim();

                // 📅 Journee header
                if (firstCell.startsWith("📅")) {
                    const h2 = document.createElement("h2");
                    h2.textContent = firstCell.replace(",", "");
                    container.appendChild(h2);
                    return;
                }

                // 🥇 Classement journée
                if (firstCell.startsWith("🥇")) {
                    const classementRow = data[data.indexOf(row) + 1] || [];
                    classementHTML = (classementRow[0] || '').trim();
                    const divClassement = document.createElement("div");
                    divClassement.className = "classement-journee";
                    divClassement.innerHTML = classementHTML.replace(/\n/g, "<br>");
                    container.appendChild(divClassement);
                    return;
                }

                // Début d'un match
                if (firstCell.startsWith("MATCH")) {
                    matchCount++;
                    if (matchCount > 10) return; // sécurité

                    currentMatch = document.createElement("table");
                    currentMatch.className = "card";

                    // Ligne header du match
                    const trHeader = document.createElement("tr");
                    const tdHeader = document.createElement("td");
                    tdHeader.colSpan = 3;
                    tdHeader.className = "match-header";
                    tdHeader.textContent = firstCell;
                    trHeader.appendChild(tdHeader);
                    currentMatch.appendChild(trHeader);

                    tableFragment.appendChild(currentMatch);
                    return;
                }

                // Ligne équipes et score
                if (currentMatch && row[1] && row[1].includes("-")) {
                    const tr = document.createElement("tr");

                    const tdDom = createLogoCell(row[0]);
                    const tdScore = document.createElement("td");
                    tdScore.textContent = row[1];
                    tdScore.style.fontWeight = "bold";
                    tdScore.style.textAlign = "center";
                    const tdExt = createLogoCell(row[2]);

                    tr.appendChild(tdDom);
                    tr.appendChild(tdScore);
                    tr.appendChild(tdExt);

                    currentMatch.appendChild(tr);
                    return;
                }

                // Lignes joueurs avec points
                if (currentMatch && row[0] && row[0] !== "#N/A") {
                    const tr = document.createElement("tr");
                    row.forEach((cell) => {
                        const td = document.createElement("td");
                        td.textContent = cell || "";
                        tr.appendChild(td);
                    });
                    currentMatch.appendChild(tr);
                    return;
                }

            });

            container.appendChild(tableFragment);
        },
        error: function(err) {
            container.textContent = 'Erreur de chargement : ' + err.message;
        }
    });
}

// Initialisation
afficherBoxingDay();
