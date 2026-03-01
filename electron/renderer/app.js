/**
 * NEON GENESIS — Behavioral Ransomware Detection Console
 * Renderer Process — Single Page Application
 * All API calls go through window.neonAPI.call() (preload bridge)
 */

"use strict";

// ─── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 1000;
const CHART_MAX_POINTS = 60;

// ─── State ────────────────────────────────────────────────────────────────────
let isMonitoring = false;
let pollTimer = null;
let burstChart = null;
let entropyChart = null;
let burstData = new Array(CHART_MAX_POINTS).fill(0);
let entropyData = new Array(CHART_MAX_POINTS).fill(0);
let currentPage = "dashboard";

// ─── API Helper ───────────────────────────────────────────────────────────────
async function api(method, endpoint, body = null) {
    try {
        const res = await window.neonAPI.call(method, endpoint, body);
        return res;
    } catch (err) {
        console.error(`[API] ${method} ${endpoint}:`, err);
        return { ok: false, data: { error: String(err) } };
    }
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function showPage(name) {
    currentPage = name;
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    const pg = document.getElementById(`page-${name}`);
    if (pg) pg.classList.add("active");
    const navItem = document.getElementById(`nav-${name}`);
    if (navItem) navItem.classList.add("active");

    // Page-specific init
    if (name === "processes") refreshProcesses();
    if (name === "backups") refreshBackupList();
    if (name === "timeline") refreshTimeline();
    if (name === "settings") loadSettings();
}

// Wire nav items
document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
});

// ─── Monitor Toggle ───────────────────────────────────────────────────────────
async function startMonitoring() {
    const res = await api("POST", "/scan/start");
    if (res.ok || (res.data && res.data.detail && res.data.detail.includes("already"))) {
        isMonitoring = true;
        updateMonitorUI(true);
        startPolling();
    }
}

async function stopMonitoring() {
    await api("POST", "/scan/stop");
    isMonitoring = false;
    updateMonitorUI(false);
    stopPolling();
    updateDashboard({ risk_score: 0, threat_state: "NORMAL", burst_rate: 0, avg_entropy: 0, suspicious_processes: [] });
}

function updateMonitorUI(active) {
    const toggle = document.getElementById("monitor-toggle");
    const label = document.getElementById("monitor-label");
    const heroBtn = document.getElementById("hero-toggle-btn");
    const heroText = document.getElementById("hero-toggle-text");

    toggle.classList.toggle("active", active);
    heroBtn.classList.toggle("active", active);
    label.textContent = active ? "Stop Monitoring" : "Start Monitoring";
    heroText.textContent = active ? "Stop Detection" : "Start Detection";
}

document.getElementById("monitor-toggle").addEventListener("click", async () => {
    if (isMonitoring) await stopMonitoring(); else await startMonitoring();
});

document.getElementById("hero-toggle-btn").addEventListener("click", async () => {
    if (isMonitoring) await stopMonitoring(); else await startMonitoring();
});

// ─── Polling Loop ──────────────────────────────────────────────────────────────
function startPolling() {
    stopPolling();
    pollTimer = setInterval(pollData, POLL_INTERVAL_MS);
}

function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

async function pollData() {
    const res = await api("GET", "/metrics");
    if (!res.ok) return;
    const data = res.data;

    // Update dashboard always (even if not visible, keeps data current)
    updateDashboard(data);

    // Refresh active page-specific data
    if (currentPage === "processes") renderProcessTable("proc-full-tbody", "proc-full-empty", data.suspicious_processes, true);
    if (currentPage === "timeline") refreshTimeline();
}

// ─── Dashboard Update (no DOM rebuild) ───────────────────────────────────────
function updateDashboard(data) {
    const risk = data.risk_score ?? 0;
    const state = data.threat_state ?? "NORMAL";
    const burst = data.burst_rate ?? 0;
    const entropy = data.avg_entropy ?? 0;
    const procs = data.suspicious_processes ?? [];

    // Risk score
    const scoreEl = document.getElementById("risk-score");
    scoreEl.textContent = Math.round(risk);
    scoreEl.className = `risk-score-number state-${state.toLowerCase()}`;

    // Badge
    const badge = document.getElementById("threat-badge");
    badge.textContent = state;
    badge.className = `threat-badge ${state}`;

    // Chart data — push, trim
    burstData.push(burst);
    entropyData.push(entropy);
    if (burstData.length > CHART_MAX_POINTS) burstData.shift();
    if (entropyData.length > CHART_MAX_POINTS) entropyData.shift();

    // Chart labels
    document.getElementById("burst-label").textContent = `${burst.toFixed(2)} modifications/sec`;
    document.getElementById("entropy-label").textContent = `${entropy.toFixed(2)} avg entropy`;

    // Repaint charts (update data only)
    drawChart("burst-chart", burstData, "#FE4A23", "rgba(254,74,35,0.15)");
    drawChart("entropy-chart", entropyData, "#8D5CFC", "rgba(141,92,252,0.15)", 8);

    // Process table (dashboard mini view — only if dashboard visible)
    if (currentPage === "dashboard") {
        renderProcessTable("proc-tbody", "proc-empty", procs, false);
        const escalated = procs.filter((p) => p.state !== "NORMAL");
        document.getElementById("proc-count").textContent = `${escalated.length} escalated`;
    }
}

// ─── Canvas Chart Renderer ────────────────────────────────────────────────────
function drawChart(canvasId, data, strokeColor, fillColor, dangerLine = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || canvas.parentElement.clientWidth;
    const H = 160;
    canvas.width = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    const max = Math.max(...data, dangerLine || 0, 0.1);
    const step = W / (CHART_MAX_POINTS - 1);

    // Fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, "transparent");

    ctx.beginPath();
    data.forEach((val, i) => {
        const x = i * step;
        const y = H - (val / max) * (H - 12) - 4;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo((data.length - 1) * step, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((val, i) => {
        const x = i * step;
        const y = H - (val / max) * (H - 12) - 4;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // Danger threshold line
    if (dangerLine) {
        const dy = H - (dangerLine / max) * (H - 12) - 4;
        ctx.beginPath();
        ctx.moveTo(0, dy);
        ctx.lineTo(W, dy);
        ctx.strokeStyle = "rgba(239,68,68,0.35)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((frac) => {
        const y = H * frac;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    });
}

// ─── Process Table Renderer ───────────────────────────────────────────────────
function renderProcessTable(tbodyId, emptyId, procs, showActions) {
    const tbody = document.getElementById(tbodyId);
    const emptyEl = document.getElementById(emptyId);
    if (!tbody) return;

    const escalated = procs.filter((p) => p.state && p.state !== "NORMAL");
    if (escalated.length === 0) {
        tbody.innerHTML = "";
        emptyEl && emptyEl.classList.add("show");
        return;
    }
    emptyEl && emptyEl.classList.remove("show");

    const frag = document.createDocumentFragment();
    escalated.forEach((proc) => {
        const tr = document.createElement("tr");
        const riskPct = Math.min(proc.risk || 0, 100);
        const riskColor = riskPct > 70 ? "#ef4444" : riskPct > 40 ? "#f59e0b" : "#8D5CFC";
        const actionsHtml = showActions
            ? `<td>
          <button class="action-btn suspend" onclick="suspendProcess(${proc.pid})">Suspend</button>
          <button class="action-btn kill" onclick="killProcess(${proc.pid})">Kill</button>
        </td>`
            : `<td><span class="contain-pill contain-${proc.containment || 'NONE'}">${proc.containment || 'NONE'}</span></td>`;

        tr.innerHTML = `
      <td><code>${proc.pid}</code></td>
      <td>${escHtml(proc.binary || 'unknown')}</td>
      <td>${proc.cpu != null ? proc.cpu.toFixed(1) : '0.0'}%</td>
      <td>
        <div class="risk-bar-wrap">
          <div class="risk-bar-bg"><div class="risk-bar-fill" style="width:${riskPct}%;background:${riskColor}"></div></div>
          <span style="font-size:12px;color:${riskColor};font-weight:700">${riskPct}</span>
        </div>
      </td>
      <td><span class="state-pill state-${proc.state || 'NORMAL'}">${proc.state || 'NORMAL'}</span></td>
      ${actionsHtml}
    `;
        frag.appendChild(tr);
    });

    tbody.innerHTML = "";
    tbody.appendChild(frag);
}

// ─── Process Actions ──────────────────────────────────────────────────────────
async function suspendProcess(pid) {
    const res = await api("POST", "/processes/suspend", { pid });
    if (res.ok) {
        showToast(`Process ${pid} suspended.`, "warning");
    } else {
        showToast(res.data?.detail || "Suspend failed.", "error");
    }
}

async function killProcess(pid) {
    const res = await api("POST", "/processes/kill", { pid });
    if (res.ok) {
        showToast(`Process ${pid} killed.`, "success");
    } else {
        showToast(res.data?.detail || "Kill failed.", "error");
    }
}

// Make accessible globally (called from inline onclick)
window.suspendProcess = suspendProcess;
window.killProcess = killProcess;

// ─── Logs ─────────────────────────────────────────────────────────────────────
document.getElementById("fetch-logs-btn").addEventListener("click", fetchAuditLogs);

async function fetchAuditLogs() {
    const res = await api("GET", "/logs/recent?limit=200");
    if (!res.ok) return;
    const logEl = document.getElementById("audit-log");
    const logs = res.data.logs || [];
    if (logs.length === 0) {
        logEl.innerHTML = '<div class="audit-empty">No log entries yet.</div>';
        return;
    }
    const frag = document.createDocumentFragment();
    logs.forEach((entry) => {
        const div = document.createElement("div");
        div.className = "audit-entry";
        div.textContent = entry;
        frag.appendChild(div);
    });
    logEl.innerHTML = "";
    logEl.appendChild(frag);
}

// ─── Processes Page ───────────────────────────────────────────────────────────
async function refreshProcesses() {
    const res = await api("GET", "/processes");
    if (!res.ok) return;
    renderProcessTable("proc-full-tbody", "proc-full-empty", res.data.processes || [], true);
}

// ─── Backups Page ─────────────────────────────────────────────────────────────
async function refreshBackupList() {
    const res = await api("GET", "/backup/list");
    if (!res.ok) return;
    renderBackupList(res.data.backups || []);
}

function renderBackupList(backups) {
    const container = document.getElementById("backup-list");
    const emptyEl = document.getElementById("backup-empty");
    if (!container) return;

    if (backups.length === 0) {
        container.innerHTML = "";
        emptyEl && emptyEl.classList.add("show");
        return;
    }
    emptyEl && emptyEl.classList.remove("show");

    const frag = document.createDocumentFragment();
    backups.forEach((b) => {
        const div = document.createElement("div");
        div.className = "backup-entry";
        const created = new Date(b.created_at).toLocaleString();
        div.innerHTML = `
      <div class="backup-info">
        <div class="backup-name">${escHtml(b.name)}</div>
        <div class="backup-meta">${created} · ${escHtml(b.size_human || '?')} · ${escHtml(b.source || '?')}${b.warn_large ? '<span class="backup-warn">⚠ Large file</span>' : ''}</div>
      </div>
      <button class="btn-sm" onclick="restoreBackup('${escAttr(b.id)}')">Restore</button>
    `;
        frag.appendChild(div);
    });
    container.innerHTML = "";
    container.appendChild(frag);
}

document.getElementById("backup-create-btn").addEventListener("click", async () => {
    const pathVal = document.getElementById("backup-path-input").value.trim();
    const nameVal = document.getElementById("backup-name-input").value.trim();
    const statusEl = document.getElementById("backup-status");
    if (!pathVal) { statusEl.className = "backup-status error"; statusEl.textContent = "Please enter a path."; return; }
    statusEl.className = "backup-status"; statusEl.textContent = "Creating snapshot…";
    const res = await api("POST", "/backup/create", { path: pathVal, name: nameVal || undefined });
    if (res.ok) {
        statusEl.className = "backup-status success";
        statusEl.textContent = `Snapshot created: ${res.data.backup.name} (${res.data.backup.size_human})`;
        appendBackupLog(`Created: ${res.data.backup.name} — ${res.data.backup.size_human}`);
        refreshBackupList();
    } else {
        statusEl.className = "backup-status error";
        statusEl.textContent = res.data?.detail || "Snapshot failed.";
    }
});

document.getElementById("backup-refresh-btn").addEventListener("click", refreshBackupList);

async function restoreBackup(id) {
    appendBackupLog(`Restoring: ${id}…`);
    const res = await api("POST", `/backup/restore/${encodeURIComponent(id)}`);
    if (res.ok) {
        appendBackupLog(`Restored: ${id} → ${res.data.path}`);
        showToast(`Restored to ${res.data.path}`, "success");
    } else {
        appendBackupLog(`Restore failed: ${res.data?.detail || 'error'}`);
        showToast(res.data?.detail || "Restore failed.", "error");
    }
}

window.restoreBackup = restoreBackup;

function appendBackupLog(msg) {
    const logEl = document.getElementById("backup-log");
    if (!logEl) return;
    const empty = logEl.querySelector(".audit-empty");
    if (empty) empty.remove();
    const div = document.createElement("div");
    div.className = "audit-entry";
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logEl.prepend(div);
}

// ─── Timeline Page ────────────────────────────────────────────────────────────
async function refreshTimeline() {
    const res = await api("GET", "/timeline?limit=100");
    if (!res.ok) return;
    renderTimeline(res.data.events || []);
}

function renderTimeline(events) {
    const feed = document.getElementById("timeline-feed");
    if (!feed) return;

    if (events.length === 0) {
        feed.innerHTML = '<div class="audit-empty">No threat events recorded yet. Start monitoring to populate the timeline.</div>';
        return;
    }

    const frag = document.createDocumentFragment();
    events.forEach((evt) => {
        const div = document.createElement("div");
        div.className = "timeline-event";
        const time = evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : "";
        const state = evt.state || "NORMAL";
        const actionColor = {
            AUTO_CONTAINMENT: "#ef4444",
            STATE_CHANGE: "#8D5CFC",
            ESCALATION: "#f59e0b",
        }[evt.action] || "#22c55e";

        div.innerHTML = `
      <div class="timeline-dot dot-${state}"></div>
      <div class="timeline-body">
        <div class="timeline-action" style="color:${actionColor}">${escHtml(evt.action || 'EVENT')}</div>
        <div class="timeline-details">State: <strong>${state}</strong> · Risk: <strong>${evt.risk ?? 0}</strong> · Entropy: ${evt.entropy ?? 0} · Burst: ${evt.burst ?? 0}</div>
      </div>
      <div class="timeline-time">${time}</div>
    `;
        frag.appendChild(div);
    });

    feed.innerHTML = "";
    feed.appendChild(frag);
}

// ─── Settings Page ────────────────────────────────────────────────────────────
let autoContainmentVal = true;

async function loadSettings() {
    const res = await api("GET", "/config");
    if (!res.ok) return;
    const cfg = res.data;
    document.getElementById("s-monitor-path").value = cfg.monitor_path || "";
    document.getElementById("s-risk-threshold").value = cfg.risk_threshold ?? 60;
    document.getElementById("s-risk-threshold-val").textContent = cfg.risk_threshold ?? 60;
    document.getElementById("s-entropy-threshold").value = cfg.entropy_threshold ?? 7.5;
    document.getElementById("s-entropy-threshold-val").textContent = (cfg.entropy_threshold ?? 7.5).toFixed(1);
    autoContainmentVal = cfg.auto_containment !== false;
    updateAutoContainmentBtn(autoContainmentVal);
}

// Slider live update
document.getElementById("s-risk-threshold").addEventListener("input", (e) => {
    document.getElementById("s-risk-threshold-val").textContent = e.target.value;
});
document.getElementById("s-entropy-threshold").addEventListener("input", (e) => {
    document.getElementById("s-entropy-threshold-val").textContent = parseFloat(e.target.value).toFixed(1);
});

// Auto containment toggle
document.getElementById("s-auto-containment").addEventListener("click", () => {
    autoContainmentVal = !autoContainmentVal;
    updateAutoContainmentBtn(autoContainmentVal);
});

function updateAutoContainmentBtn(val) {
    const btn = document.getElementById("s-auto-containment");
    const label = document.getElementById("s-auto-containment-label");
    btn.classList.toggle("active", val);
    label.textContent = val ? "Enabled" : "Disabled";
}

document.getElementById("settings-save-btn").addEventListener("click", async () => {
    const path = document.getElementById("s-monitor-path").value.trim();
    const risk = parseInt(document.getElementById("s-risk-threshold").value);
    const entropy = parseFloat(document.getElementById("s-entropy-threshold").value);
    const statusEl = document.getElementById("save-status");

    if (!path) { statusEl.className = "save-status error"; statusEl.textContent = "Monitor path required."; return; }

    statusEl.className = "save-status"; statusEl.textContent = "Saving…";

    const res = await api("POST", "/config/update", {
        monitor_path: path,
        risk_threshold: risk,
        entropy_threshold: entropy,
        auto_containment: autoContainmentVal,
    });

    if (res.ok) {
        statusEl.className = "save-status success"; statusEl.textContent = "✓ Saved successfully.";
    } else {
        statusEl.className = "save-status error"; statusEl.textContent = res.data?.detail || "Save failed.";
    }
    setTimeout(() => { statusEl.textContent = ""; }, 3000);
});

// ─── Toast Notification ───────────────────────────────────────────────────────
function showToast(msg, type = "success") {
    let toastEl = document.getElementById("ng-toast");
    if (!toastEl) {
        toastEl = document.createElement("div");
        toastEl.id = "ng-toast";
        document.body.appendChild(toastEl);

        Object.assign(toastEl.style, {
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: "9999",
            padding: "12px 20px",
            borderRadius: "10px",
            fontFamily: "var(--font, sans-serif)",
            fontSize: "13px",
            fontWeight: "600",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            transition: "all 0.3s ease",
            opacity: "0",
            transform: "translateY(10px)",
        });
    }

    const colors = {
        success: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", border: "rgba(34,197,94,0.3)" },
        warning: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
        error: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
    }[type] || colors.success;

    Object.assign(toastEl.style, {
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
    });

    toastEl.textContent = msg;
    requestAnimationFrame(() => {
        toastEl.style.opacity = "1";
        toastEl.style.transform = "translateY(0)";
    });

    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
        toastEl.style.opacity = "0";
        toastEl.style.transform = "translateY(10px)";
    }, 3000);
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escAttr(str) {
    return String(str).replace(/'/g, "\\'");
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
    // Check if backend has active scan
    const res = await api("GET", "/scan/status");
    if (res.ok && res.data.active) {
        isMonitoring = true;
        updateMonitorUI(true);
        startPolling();
    }

    // Initial dashboard draw with zeros
    updateDashboard({ risk_score: 0, threat_state: "NORMAL", burst_rate: 0, avg_entropy: 0, suspicious_processes: [] });
}

init();
