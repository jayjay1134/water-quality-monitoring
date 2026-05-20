let sensorChart;

async function loadChart() {
    const res = await fetch('api/chart.php');
    const json = await res.json();
    const rows = json.data || [];

    const labels = rows.map(r => r.created_at);
    const datasets = [
        { label: 'pH', data: rows.map(r => Number(r.ph)) },
        { label: 'Turbidity', data: rows.map(r => Number(r.turbidity)) },
        { label: 'Temperature', data: rows.map(r => Number(r.temperature)) },
        { label: 'TDS / 100', data: rows.map(r => Number(r.tds) / 100) },
        { label: 'DO', data: rows.map(r => Number(r.dissolved_oxygen)) }
    ];

    const ctx = document.getElementById('sensorChart');
    if (!ctx) return;

    if (sensorChart) {
        sensorChart.data.labels = labels;
        sensorChart.data.datasets.forEach((ds, i) => ds.data = datasets[i].data);
        sensorChart.update();
        return;
    }

    sensorChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#e5e7eb' } } },
            scales: {
                x: { ticks: { color: '#94a3b8', maxRotation: 45 }, grid: { color: '#1e293b' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
            }
        }
    });
}

async function loadLatest() {
    const res = await fetch('api/latest.php');
    const json = await res.json();
    const r = json.data;
    if (!r) return;
    ['ph','turbidity','temperature','tds','dissolved_oxygen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = r[id];
    });
}

loadChart();
loadLatest();
setInterval(() => { loadLatest(); loadChart(); }, 5000);
