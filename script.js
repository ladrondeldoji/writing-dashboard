let entries = JSON.parse(localStorage.getItem("entries")) || [];

const form = document.getElementById("entry-form");
const tableBody = document.querySelector("#records-table tbody");
const projectFilter = document.getElementById("project-filter");
const projectAveragesDiv = document.getElementById("project-averages");

let chart;

// 🧮 Renderizar tabla según filtro
function renderTable() {
  const filter = projectFilter.value;
  const filtered = filter === "all" ? entries : entries.filter(e => e.project === filter);

  tableBody.innerHTML = "";
  filtered
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

// 📈 Actualizar estadísticas globales
function updateStats() {
  if (entries.length === 0) return;

  const total = entries.reduce((sum, e) => sum + e.words, 0);
  document.getElementById("total").textContent = `Total de palabras: ${total}`;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const todayWords = entries.filter(e => e.date === todayStr).reduce((s, e) => s + e.words, 0);

  const weekAgo = new Date(now - 7 * 86400000);
  const monthAgo = new Date(now - 30 * 86400000);

  const weeklyWords = entries.filter(e => new Date(e.date) >= weekAgo).reduce((s, e) => s + e.words, 0);
  const monthlyWords = entries.filter(e => new Date(e.date) >= monthAgo).reduce((s, e) => s + e.words, 0);

  document.getElementById("daily").textContent = `Hoy: ${todayWords} palabras`;
  document.getElementById("weekly").textContent = `Últimos 7 días: ${weeklyWords} palabras`;
  document.getElementById("monthly").textContent = `Últimos 30 días: ${monthlyWords} palabras`;
}

// 📊 Gráfico general de progreso
function renderChart() {
  const filter = projectFilter.value;
  const ctx = document.getElementById("chart").getContext("2d");
  const filtered = filter === "all" ? entries : entries.filter(e => e.project === filter);

  const dataByDate = {};
  filtered.forEach(e => {
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
        label: filter === "all" ? "Palabras (total)" : `Palabras - ${filter}`,
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

// 🧠 Calcular medias por proyecto
function updateProjectAverages() {
  const projects = [...new Set(entries.map(e => e.project))];
  projectAveragesDiv.innerHTML = "";

  projects.forEach(p => {
    const projectEntries = entries.filter(e => e.project === p);
    if (projectEntries.length === 0) return;

    const total = projectEntries.reduce((s, e) => s + e.words, 0);
    const firstDate = new Date(Math.min(...projectEntries.map(e => new Date(e.date))));
    const daysElapsed = Math.max(1, (new Date() - firstDate) / 86400000);
    const avgDaily = total / daysElapsed;

    const now = new Date();
    const weekAgo = new Date(now - 7 * 86400000);
    const monthAgo = new Date(now - 30 * 86400000);

    const weekly = projectEntries.filter(e => new Date(e.date) >= weekAgo).reduce((s, e) => s + e.words, 0);
    const monthly = projectEntries.filter(e => new Date(e.date) >= monthAgo).reduce((s, e) => s + e.words, 0);

    const div = document.createElement("div");
    div.innerHTML = `<b>${p}</b> — Media diaria: ${avgDaily.toFixed(0)} | 7 días: ${weekly} | 30 días: ${monthly}`;
    projectAveragesDiv.appendChild(div);
  });
}

// 🧩 Actualizar selector de proyectos
function updateProjectFilter() {
  const projects = [...new Set(entries.map(e => e.project))];
  projectFilter.innerHTML = '<option value="all">Todos los proyectos</option>';
  projects.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    projectFilter.appendChild(opt);
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

  updateProjectFilter();
  renderTable();
  updateStats();
  updateProjectAverages();
  renderChart();
});

// 🎛️ Cambio de filtro
projectFilter.addEventListener("change", () => {
  renderTable();
  renderChart();
});

// 🚀 Inicialización
updateProjectFilter();
renderTable();
updateStats();
updateProjectAverages();
renderChart();
