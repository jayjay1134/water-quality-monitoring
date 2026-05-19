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

const thresholdsRef = ref(db, "thresholds");

const defaultThresholds = {
    ph: { unit: "pH", min: 6.5, max: 8.5, message: "Unsafe pH detected" },
    turbidity: { unit: "NTU", min: 0, max: 5, message: "High turbidity detected" },
    temperature: { unit: "°C", min: 20, max: 35, message: "Unsafe temperature detected" },
    tds: { unit: "ppm", min: 0, max: 500, message: "High TDS detected" },
    dissolved_oxygen: { unit: "mg/L", min: 5, max: 14, message: "Low dissolved oxygen detected" }
};

let thresholds = {};

onValue(thresholdsRef, snapshot => {
    thresholds = snapshot.val() || defaultThresholds;

    if (!snapshot.val()) {
        set(thresholdsRef, defaultThresholds);
    }

    renderThresholds();
});

function renderThresholds() {
    const table = document.getElementById("thresholdTable");
    table.innerHTML = "";

    Object.keys(thresholds).forEach(key => {
        const t = thresholds[key];

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${key}</td>
            <td>${t.unit || ""}</td>
            <td><input type="number" step="0.01" id="${key}_min" value="${t.min}"></td>
            <td><input type="number" step="0.01" id="${key}_max" value="${t.max}"></td>
            <td>${t.message || ""}</td>
        `;
        table.appendChild(tr);
    });
}

document.getElementById("saveThresholds").addEventListener("click", async () => {
    Object.keys(thresholds).forEach(key => {
        thresholds[key].min = Number(document.getElementById(`${key}_min`).value);
        thresholds[key].max = Number(document.getElementById(`${key}_max`).value);
    });

    await set(thresholdsRef, thresholds);
    document.getElementById("saveMessage").textContent = "Thresholds saved successfully.";
});
