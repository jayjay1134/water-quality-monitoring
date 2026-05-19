import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
    getDatabase,
    ref,
    onValue,
    query,
    limitToLast,
    set
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function formatDate(timestamp) {
    if (!timestamp) return "--";
    return new Date(timestamp).toLocaleString();
}

function getStatusClass(status) {
    const value = String(status || "").toLowerCase();
    if (value === "safe") return "safe";
    if (value === "warning") return "warning";
    if (value === "unsafe") return "unsafe";
    return "safe";
}

function safeNumber(value, decimals = 2) {
    const num = Number(value);
    if (Number.isNaN(num)) return "--";
    return num.toFixed(decimals);
}

const latestRef = ref(db, "latest_reading");
const readingsRef = query(ref(db, "readings"), limitToLast(30));
const thresholdsRef = ref(db, "thresholds");

let sensorChart = null;

onValue(thresholdsRef, snapshot => {
    const t = snapshot.val();
    if (!t) return;

    if (t.ph) document.getElementById("phLimit").textContent = `Safe: ${t.ph.min} - ${t.ph.max}`;
    if (t.turbidity) document.getElementById("turbidityLimit").textContent = `Safe: ${t.turbidity.min} - ${t.turbidity.max} NTU`;
    if (t.temperature) document.getElementById("temperatureLimit").textContent = `Safe: ${t.temperature.min} - ${t.temperature.max} °C`;
    if (t.tds) document.getElementById("tdsLimit").textContent = `Safe: ${t.tds.min} - ${t.tds.max} ppm`;
    if (t.dissolved_oxygen) document.getElementById("doLimit").textContent = `Safe: ${t.dissolved_oxygen.min} - ${t.dissolved_oxygen.max} mg/L`;
});

onValue(latestRef, snapshot => {
    const data = snapshot.val();
    if (!data) return;

    document.getElementById("phValue").textContent = safeNumber(data.ph);
    document.getElementById("turbidityValue").textContent = safeNumber(data.turbidity) + " NTU";
    document.getElementById("temperatureValue").textContent = safeNumber(data.temperature) + " °C";
    document.getElementById("tdsValue").textContent = safeNumber(data.tds) + " ppm";
    document.getElementById("doValue").textContent = safeNumber(data.dissolved_oxygen) + " mg/L";

    document.getElementById("deviceId").textContent = data.device_id || "ESP32-WQMS-01";
    document.getElementById("latestStatus").textContent = data.status || "--";
    document.getElementById("remarks").textContent = data.remarks || "--";
    document.getElementById("createdAt").textContent = formatDate(data.timestamp);

    const status = document.getElementById("systemStatus");
    status.textContent = data.status || "NO DATA";
    status.className = "status-pill " + getStatusClass(data.status);
});

onValue(readingsRef, snapshot => {
    const data = snapshot.val() || {};
    const rows = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
    updateChart(rows);
});

function updateChart(rows) {
    const labels = rows.map(row => new Date(row.timestamp).toLocaleTimeString());

    const data = {
        labels,
        datasets: [
            { label: "pH", data: rows.map(row => Number(row.ph)) },
            { label: "Turbidity", data: rows.map(row => Number(row.turbidity)) },
            { label: "Temperature", data: rows.map(row => Number(row.temperature)) },
            { label: "TDS / 100", data: rows.map(row => Number(row.tds) / 100) },
            { label: "Dissolved Oxygen", data: rows.map(row => Number(row.dissolved_oxygen)) }
        ]
    };

    const ctx = document.getElementById("sensorChart");

    if (sensorChart) {
        sensorChart.data = data;
        sensorChart.update();
        return;
    }

    sensorChart = new Chart(ctx, {
        type: "line",
        data,
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: "#e5e7eb" } } },
            scales: {
                x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
                y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } }
            }
        }
    });
}
