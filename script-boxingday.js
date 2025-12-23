// =====================
// Script Boxing Day - classement corrigé
// =====================

const urlBoxingDay = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=329510180&single=true&output=csv";
const container = document.getElementById('table-container');
const baseImagePath = "https://baptisteclr37.github.io/lachattefc2526/images/";

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

            data.forEach((row, rowIndex) => {
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
                    const classementRow = data[rowIndex + 1] || [];
                    classementHTML = (classementRow[0] || '').trim();

                    // Transformation en array par joueur
                    let classementArray = classementHTML.split(/\r?\n/).map(x => x.trim()).filter(x => x !== "");

                    // Ordre alphanumérique (numéro puis prénom)
                    classementArray.sort((a, b) => {
                        const numA = parseInt(a.split(".")[0]) || 0;
                        const numB = parseInt(b.split(".")[0]) || 0;
                        if (numA !== numB) return numA - numB;
                        const nameA = a.replace(/^\d+\.\s*/, "");
                        const nameB = b.replace(/^\d+\.\s*/, "");
                        return nameA.localeCompare(nameB, undefined, {sensitivity: 'base'});
                    });

                    // Création de la card
                    const card = document.createElement("table");
                    card.className = "card";
                    const trHeader = document.createElement("tr");
                    const tdHeader = document.createElement("td");
                    tdHeader.colSpan = 3;
                    tdHeader.className = "classement-journee-header";
                    tdHeader.textContent = "🥇🥈🥉 CLASSEMENT JOURNEE";
                    trHeader.appendChild(tdHeader);
                    card.appendChild(trHeader);

                    const trContent = document.createElement("tr");
                    const tdContent = document.createElement("td");
                    tdContent.colSpan = 3;
                    tdContent.className = "classement-journee";
                    tdContent.innerHTML = classementArray.join("<br>");
                    trContent.appendChild(tdContent);
                    card.appendChild(trContent);

                    container.appendChild(card);
                    return;
                }

                // Début d'un match
                if (firstCell.startsWith("MATCH")) {
                    matchCount++;
                    if (matchCount > 10) return;

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
