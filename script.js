let entries = JSON.parse(localStorage.getItem("entries")) || [];

const form = document.getElementById("entry-form");
const tableBody = document.querySelector("#records-table tbody");

// 🧮 Función para actualizar la tabla
function renderTable() {
  tableBody.innerHTML = "";
  entries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(e => {
      const row = `<tr>
        <td>${e.project}</td>
        <td>${e.date}</td>
        <td>${e.words}</td>
      </tr>`;
      tableBody.innerHTML += row;
    });
}

// 📈 Función para actualizar las estadísticas
function updateStats() {
  if (entries.length === 0) return;

  const total = entries.reduce((sum, e) => sum + e.words, 0);
  document.getElementById("total").textContent = `Total de palabras: ${total}`;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const todayWords = entries
    .filter(e => e.date === todayStr)
    .reduce((s, e) => s + e.words, 0);

  const weekAgo = new Date(now - 7 * 86400000);
  const monthAgo = new Date(now - 30 * 86400000);

  const weeklyWords = entries
    .filter(e => new Date(e.date) >= weekAgo)
    .reduce((s, e) => s + e.words, 0);

  const monthlyWords = entries
    .filter(e => new Date(e.date) >= monthAgo)
    .reduce((s, e) => s + e.words, 0);

  document.getElementById("daily").textContent = `Hoy: ${todayWords} palabras`;
  document.getElementById("weekly").textContent = `Últimos 7 días: ${weeklyWords} palabras`;
  document.getElementById("monthly").textContent = `Últimos 30 días: ${monthlyWords} palabras`;
}

// 📊 Gráfico con Chart.js
let chart;
function renderChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  const dataByDate = {};

  entries.forEach(e => {
    dataByDate[e.date] = (dataByDate[e.date] || 0) + e.words;
  });

  const labels = Object.keys(dataByDate).sort();
  const data = labels.map(k => dataByDate[k]);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Palabras escritas por día",
        data,
        fill: true,
        borderColor: "#1e6091",
        backgroundColor: "rgba(30,96,145,0.1)"
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}

// 📝 Guardar nuevo registro
form.addEventListener("submit", e => {
  e.preventDefault();
  const entry = {
    project: document.getElementById("project").value.trim(),
    date: document.getElementById("date").value,
    words: parseInt(document.getElementById("words").value)
  };

  if (!entry.project || !entry.date || isNaN(entry.words)) return;

  entries.push(entry);
  localStorage.setItem("entries", JSON.stringify(entries));
  form.reset();
  renderTable();
  updateStats();
  renderChart();
});

// 🧠 Inicialización
renderTable();
updateStats();
renderChart();
