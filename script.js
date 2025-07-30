const url = 'https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vSuc-XJn1YmTCl-5WtrYeOKBS8nfTnRsFCfeNMRvzJcbavfGIX9SUSQdlZnVNPQtapcgr2m4tAwYznB/pub?gid=363948896&single=true&output=csv';

Papa.parse(url, {
  download: true,
  header: false,
  complete: function(results) {
    console.log("✅ CSV chargé !");
    console.log(results.data); // Affiche toutes les lignes du CSV

    const data = results.data;

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("⚠️ Données CSV vides ou mal formatées");
      document.getElementById('output').textContent = 'Aucune donnée trouvée dans le CSV.';
      return;
    }

    // Affichage simple pour test : 5 premières lignes
    const output = document.getElementById('output');
    output.innerHTML = '<h2>Données CSV chargées :</h2>';
    output.innerHTML += '<pre>' + data.slice(0, 5).map(row => row.join(' | ')).join('\n') + '</pre>';

    // Ensuite on pourra afficher un tableau plus propre ici
  },
  error: function(err) {
    console.error("❌ Erreur de chargement CSV :", err);
    document.getElementById("output").textContent = "Erreur : " + err.message;
  }
});
