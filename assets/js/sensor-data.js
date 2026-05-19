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

const readingsRef = query(ref(db, "readings"), limitToLast(100));
let rowsCache = [];

onValue(readingsRef, snapshot => {
    const data = snapshot.val() || {};
    rowsCache = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);

    const table = document.getElementById("readingsTable");
    table.innerHTML = "";

    rowsCache.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatDate(row.timestamp)}</td>
            <td>${safeNumber(row.ph)}</td>
            <td>${safeNumber(row.turbidity)}</td>
            <td>${safeNumber(row.temperature)}</td>
            <td>${safeNumber(row.tds)}</td>
            <td>${safeNumber(row.dissolved_oxygen)}</td>
            <td><span class="badge ${getStatusClass(row.status)}">${row.status || "--"}</span></td>
        `;
        table.appendChild(tr);
    });
});

window.exportCSV = function () {
    let csv = "Date/Time,pH,Turbidity,Temperature,TDS,Dissolved Oxygen,Status\n";
    rowsCache.forEach(row => {
        csv += [formatDate(row.timestamp), row.ph, row.turbidity, row.temperature, row.tds, row.dissolved_oxygen, row.status].join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "water_quality_readings.csv";
    a.click();
    URL.revokeObjectURL(url);
};
