const url = 'https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv';

function formatPronostics(ligne) {
  return ligne.split(/\s+/).map(pair => {
    return pair.replace('(', ' (');
  }).join('\n');
}

Papa.parse(url, {
  download: true,
  header: false,
  complete: function(results) {
    const data = results.data;
    const output = document.getElementById("output");
    output.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
      const line = data[i];
      if (line[0] && line[0].startsWith("Match N°")) {
        const matchTitle = data[i + 1][0] || "";
        const pronos1 = data[i + 4] ? data[i + 4][0] : "";
        const pronosN = data[i + 4] ? data[i + 4][1] : "";
        const pronos2 = data[i + 4] ? data[i + 4][2] : "";

        const block = document.createElement("div");
        block.className = "match-block";
        block.innerHTML = `
          <h2>${matchTitle}</h2>
          <div class="pronos">
            <div class="prono-column"><h3>1</h3><pre class="player">${formatPronostics(pronos1)}</pre></div>
            <div class="prono-column"><h3>N</h3><pre class="player">${formatPronostics(pronosN)}</pre></div>
            <div class="prono-column"><h3>2</h3><pre class="player">${formatPronostics(pronos2)}</pre></div>
          </div>
        `;
        output.appendChild(block);
        i += 5;
      }
    }
  },
  error: function(err) {
    document.getElementById("output").textContent = "Erreur : " + err.message;
  }
});
