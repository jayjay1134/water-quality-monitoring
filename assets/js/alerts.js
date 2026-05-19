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

const alertsRef = query(ref(db, "alerts"), limitToLast(100));

onValue(alertsRef, snapshot => {
    const data = snapshot.val() || {};
    const rows = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);

    const table = document.getElementById("alertsTable");
    table.innerHTML = "";

    rows.forEach(alert => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatDate(alert.timestamp)}</td>
            <td>${alert.parameter || "--"}</td>
            <td>${safeNumber(alert.value)}</td>
            <td><span class="badge ${getStatusClass(alert.severity)}">${alert.severity || "--"}</span></td>
            <td>${alert.message || "--"}</td>
        `;
        table.appendChild(tr);
    });
});
