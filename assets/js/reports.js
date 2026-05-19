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

const readingsRef = ref(db, "readings");
const alertsRef = ref(db, "alerts");

onValue(readingsRef, snapshot => {
    const data = snapshot.val() || {};
    const rows = Object.values(data);

    document.getElementById("totalReadings").textContent = rows.length;
    document.getElementById("safeCount").textContent = rows.filter(r => r.status === "SAFE").length;
    document.getElementById("warningCount").textContent = rows.filter(r => r.status === "WARNING").length;
    document.getElementById("unsafeCount").textContent = rows.filter(r => r.status === "UNSAFE").length;
});

onValue(alertsRef, snapshot => {
    const data = snapshot.val() || {};
    document.getElementById("alertCount").textContent = Object.values(data).length;
});
