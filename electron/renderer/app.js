/**
 * PROMETHEUS — Behavioral Ransomware Detection Console
 * Renderer Process — Single Page Application
 *
 * KEY: All interactive table buttons use data-action/data-pid with event delegation,
 *      NOT inline onclick. This is required by the CSP (script-src 'self').
 */

"use strict";

// ─── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 1500;
const CHART_MAX_POINTS = 60;

// ─── State ────────────────────────────────────────────────────────────────────
let isMonitoring = false;
let pollTimer = null;
let burstData = new Array(CHART_MAX_POINTS).fill(0);
let entropyData = new Array(CHART_MAX_POINTS).fill(0);
let currentPage = "dashboard";
let allProcessCache = [];

// ─── API Helper ───────────────────────────────────────────────────────────────
async function api(method, endpoint, body = null) {
    try {
        return await window.neonAPI.call(method, endpoint, body);
    } catch (err) {
        console.error(`[API] ${method} ${endpoint}:`, err);
        return { ok: false, status: 0, data: { error: String(err) } };
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

    if (name === "processes") refreshProcesses();
    if (name === "backups") refreshBackupList();
    if (name === "timeline") refreshTimeline();
    if (name === "settings") loadSettings();
}

document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
});

// ─── Monitor Toggle ───────────────────────────────────────────────────────────
async function startMonitoring() {
    const res = await api("POST", "/scan/start");
    if (res.ok || (res.data?.detail || "").includes("already")) {
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
    document.getElementById("monitor-toggle").classList.toggle("active", active);
    document.getElementById("hero-toggle-btn").classList.toggle("active", active);
    document.getElementById("monitor-label").textContent = active ? "Stop Monitoring" : "Start Monitoring";
    document.getElementById("hero-toggle-text").textContent = active ? "Stop Detection" : "Start Detection";
}
document.getElementById("monitor-toggle").addEventListener("click", () => isMonitoring ? stopMonitoring() : startMonitoring());
document.getElementById("hero-toggle-btn").addEventListener("click", () => isMonitoring ? stopMonitoring() : startMonitoring());

// ─── Polling ──────────────────────────────────────────────────────────────────
function startPolling() { stopPolling(); pollTimer = setInterval(pollData, POLL_INTERVAL_MS); }
function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

async function pollData() {
    const res = await api("GET", "/metrics");
    if (!res.ok) return;
    updateDashboard(res.data);
    if (currentPage === "processes") refreshProcesses();
    if (currentPage === "timeline") refreshTimeline();
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function updateDashboard(data) {
    const risk = data.risk_score ?? 0;
    const state = data.threat_state ?? "NORMAL";
    const burst = data.burst_rate ?? 0;
    const entropy = data.avg_entropy ?? 0;
    const procs = data.suspicious_processes ?? [];

    const scoreEl = document.getElementById("risk-score");
    scoreEl.textContent = Math.round(risk);
    scoreEl.className = `risk-score-number state-${state.toLowerCase()}`;

    const badge = document.getElementById("threat-badge");
    badge.textContent = state;
    badge.className = `threat-badge ${state}`;

    burstData.push(burst); if (burstData.length > CHART_MAX_POINTS) burstData.shift();
    entropyData.push(entropy); if (entropyData.length > CHART_MAX_POINTS) entropyData.shift();

    document.getElementById("burst-label").textContent = `${burst.toFixed(2)} modifications/sec`;
    document.getElementById("entropy-label").textContent = `${entropy.toFixed(2)} avg entropy`;

    drawChart("burst-chart", burstData, "#FE4A23", "rgba(254,74,35,0.15)");
    drawChart("entropy-chart", entropyData, "#8D5CFC", "rgba(141,92,252,0.15)", 8);

    if (currentPage === "dashboard") {
        const live = procs.filter((p) => p.state && p.state !== "NORMAL" && p.alive !== false);
        renderDashboardProcessTable(live);
        document.getElementById("proc-count").textContent = `${live.length} escalated`;
    }
}

// ─── Canvas Chart ─────────────────────────────────────────────────────────────
function drawChart(canvasId, data, strokeColor, fillColor, dangerLine = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || canvas.parentElement.clientWidth;
    const H = 160;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const max = Math.max(...data, dangerLine || 0, 0.1);
    const step = W / (CHART_MAX_POINTS - 1);
    const y = (val) => H - (val / max) * (H - 12) - 4;

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, "transparent");
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(i * step, y(v)) : ctx.lineTo(i * step, y(v)));
    ctx.lineTo((data.length - 1) * step, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(i * step, y(v)) : ctx.lineTo(i * step, y(v)));
    ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();

    if (dangerLine) {
        const dy = y(dangerLine);
        ctx.beginPath(); ctx.moveTo(0, dy); ctx.lineTo(W, dy);
        ctx.strokeStyle = "rgba(239,68,68,0.35)"; ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((f) => { ctx.beginPath(); ctx.moveTo(0, H * f); ctx.lineTo(W, H * f); ctx.stroke(); });
}

// ─── Dashboard Mini Process Table (no actions) ────────────────────────────────
function renderDashboardProcessTable(procs) {
    const tbody = document.getElementById("proc-tbody");
    const emptyEl = document.getElementById("proc-empty");
    if (!tbody) return;
    if (procs.length === 0) {
        tbody.innerHTML = "";
        emptyEl?.classList.add("show");
        return;
    }
    emptyEl?.classList.remove("show");
    const frag = document.createDocumentFragment();
    procs.slice(0, 8).forEach((proc) => {
        const tr = document.createElement("tr");
        const riskPct = Math.min(proc.risk || 0, 100);
        const riskColor = riskPct > 70 ? "#ef4444" : riskPct > 40 ? "#f59e0b" : "#8D5CFC";
        tr.innerHTML = `
      <td><code>${proc.pid}</code></td>
      <td>${escHtml(proc.binary || "unknown")}</td>
      <td>${(proc.cpu ?? 0).toFixed(1)}%</td>
      <td>
        <div class="risk-bar-wrap">
          <div class="risk-bar-bg"><div class="risk-bar-fill" style="width:${riskPct}%;background:${riskColor}"></div></div>
          <span style="font-size:12px;color:${riskColor};font-weight:700">${riskPct}</span>
        </div>
      </td>
      <td><span class="state-pill state-${proc.state || 'NORMAL'}">${proc.state || 'NORMAL'}</span></td>
      <td><span class="contain-pill contain-${proc.containment || 'NONE'}">${proc.containment || 'NONE'}</span></td>
    `;
        frag.appendChild(tr);
    });
    tbody.innerHTML = "";
    tbody.appendChild(frag);
}

// ─── Full Process Manager ─────────────────────────────────────────────────────
async function refreshProcesses() {
    const res = await api("GET", "/processes/all");
    if (!res.ok) return;
    allProcessCache = res.data.processes || [];
    renderAllProcesses();
}

function renderAllProcesses() {
    const search = (document.getElementById("proc-search")?.value || "").toLowerCase().trim();
    const flaggedOnly = document.getElementById("proc-flagged-only")?.checked || false;
    const tbody = document.getElementById("proc-full-tbody");
    const emptyEl = document.getElementById("proc-full-empty");
    if (!tbody) return;

    let list = allProcessCache;
    if (flaggedOnly) list = list.filter((p) => p.flagged);
    if (search) list = list.filter((p) =>
        String(p.pid).includes(search) ||
        (p.binary || "").toLowerCase().includes(search) ||
        (p.username || "").toLowerCase().includes(search)
    );

    const flaggedCount = allProcessCache.filter((p) => p.flagged).length;
    const badge = document.getElementById("proc-registry-count");
    if (badge) badge.textContent = `${flaggedCount} flagged`;
    const totalBadge = document.getElementById("proc-total-count");
    if (totalBadge) totalBadge.textContent = `${allProcessCache.length} total`;

    if (list.length === 0) {
        tbody.innerHTML = "";
        emptyEl?.classList.add("show");
        return;
    }
    emptyEl?.classList.remove("show");

    const frag = document.createDocumentFragment();
    list.forEach((proc) => {
        const tr = document.createElement("tr");
        const isDead = proc.alive === false;
        const isFlagged = proc.flagged;
        const inDir = proc.in_monitored_dir;

        // Row highlight: monitored-dir > flagged > normal
        if (inDir && isFlagged && !isDead) {
            tr.style.cssText = "background:rgba(254,74,35,0.12);border-left:3px solid var(--accent)";
        } else if (inDir && !isDead) {
            tr.style.cssText = "background:rgba(141,92,252,0.07);border-left:3px solid #8D5CFC";
        } else if (isFlagged && !isDead) {
            tr.style.cssText = "background:rgba(254,74,35,0.06);border-left:2px solid var(--accent)";
        } else if (isDead) {
            tr.style.opacity = "0.4";
        }

        const memStr = proc.mem_kb > 1024 ? `${(proc.mem_kb / 1024).toFixed(1)} MB` : `${proc.mem_kb} KB`;
        const dirBadge = inDir ? `<span style="background:rgba(141,92,252,0.2);color:#8D5CFC;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:5px">DIR</span>` : "";

        let threatHtml;
        if (isFlagged) {
            const sc = isDead ? "state-CONTAINING" : `state-${proc.state || "WATCH"}`;
            const sl = isDead ? "DEAD" : (proc.state || "WATCH");
            threatHtml = `<td><span style="color:var(--accent);font-weight:700;margin-right:3px">&#x26A0;</span><span class="state-pill ${sc}">${sl}</span></td>`;
        } else {
            threatHtml = `<td><span style="color:var(--text-muted);font-size:12px">—</span></td>`;
        }

        // Actions: use data-action + data-pid (NO inline onclick — CSP blocks it)
        let actionsHtml;
        if (isDead) {
            actionsHtml = `<td>
        <span style="font-size:11px;color:var(--text-muted);margin-right:4px">Ended</span>
        <button class="action-btn" data-action="dismiss" data-pid="${proc.pid}">Dismiss</button>
      </td>`;
        } else {
            const dismissBtn = isFlagged
                ? `<button class="action-btn" data-action="dismiss" data-pid="${proc.pid}" title="Remove threat flag">Dismiss</button>`
                : "";
            actionsHtml = `<td>
        <button class="action-btn suspend" data-action="suspend" data-pid="${proc.pid}">Suspend</button>
        <button class="action-btn kill"    data-action="kill"    data-pid="${proc.pid}">Kill</button>
        ${dismissBtn}
      </td>`;
        }

        tr.innerHTML = `
      <td><code>${proc.pid}</code></td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(proc.binary || '')}">${escHtml(proc.binary || "unknown")}${dirBadge}</td>
      <td style="font-size:11px;color:var(--text-muted)">${escHtml(proc.username || "?")}</td>
      <td>${(proc.cpu ?? 0).toFixed(1)}%</td>
      <td style="font-size:12px;color:var(--text-secondary)">${memStr}</td>
      <td><span style="font-size:11px;color:var(--text-muted);text-transform:capitalize">${escHtml(proc.status || "?")}</span></td>
      ${threatHtml}
      ${actionsHtml}
    `;
        frag.appendChild(tr);
    });

    tbody.innerHTML = "";
    tbody.appendChild(frag);
}

// ─── Event Delegation for Process Table (bypasses CSP inline-handler block) ───
document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const pid = parseInt(btn.dataset.pid, 10);
    if (!action || !pid) return;

    if (action === "suspend") await doSuspend(pid);
    if (action === "kill") await doKill(pid);
    if (action === "dismiss") await doDismiss(pid);
});

// ─── Process Actions ──────────────────────────────────────────────────────────
async function doSuspend(pid) {
    const res = await api("POST", "/processes/suspend", { pid });
    if (res.ok) {
        showToast(`Process ${pid} (${res.data?.name || ""}) suspended — frozen.`, "warning");
        setTimeout(refreshProcesses, 500);
    } else {
        const msg = res.data?.detail || "Suspend failed.";
        if (res.status === 403) {
            showToast(`${msg} — trying with elevated privileges…`, "warning");
            await doPrivilegedKill(pid); // pkexec suspend isn't standard; kill as escalation
        } else {
            showToast(msg, "error");
        }
    }
}

async function doKill(pid) {
    const res = await api("POST", "/processes/kill", { pid });
    if (res.ok) {
        showToast(`Process ${pid} (${res.data?.name || ""}) killed.`, "success");
        setTimeout(refreshProcesses, 500);
    } else {
        const msg = res.data?.detail || "Kill failed.";
        if (res.status === 403) {
            // Permission denied — escalate via pkexec (shows system password dialog)
            showToast("Permission denied — requesting elevated privileges…", "warning");
            await doPrivilegedKill(pid);
        } else {
            showToast(msg, "error");
        }
    }
}

async function doPrivilegedKill(pid) {
    showToast("System password dialog opening to authorize kill…", "warning");
    try {
        const res = await window.neonAPI.killPrivileged(pid);
        if (res.ok) {
            showToast(`Process ${pid} force-killed with elevated privileges.`, "success");
            // Also remove from backend registry
            await api("POST", `/processes/clear/${pid}`);
            setTimeout(refreshProcesses, 500);
        } else {
            showToast(`Force kill failed: ${res.error || "cancelled or denied"}`, "error");
        }
    } catch (err) {
        showToast(`Privileged kill unavailable: ${err}`, "error");
    }
}

async function doDismiss(pid) {
    await api("POST", `/processes/clear/${pid}`);
    showToast(`Process ${pid} dismissed from registry.`, "success");
    refreshProcesses();
}

async function clearAllProcesses() {
    await api("POST", "/processes/clear-all");
    showToast("All threat flags cleared.", "success");
    refreshProcesses();
}

// ─── Logs ─────────────────────────────────────────────────────────────────────
document.getElementById("fetch-logs-btn").addEventListener("click", fetchAuditLogs);
async function fetchAuditLogs() {
    const res = await api("GET", "/logs/recent?limit=200");
    if (!res.ok) return;
    const logEl = document.getElementById("audit-log");
    const logs = res.data.logs || [];
    if (logs.length === 0) { logEl.innerHTML = '<div class="audit-empty">No log entries yet.</div>'; return; }
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

// ─── Backups (Cloud / GCS) ────────────────────────────────────────────────────
async function refreshBackupList() {
    const res = await api("GET", "/backup/list");
    if (!res.ok) return;
    const data = res.data;
    const backups = data.backups || [];
    const cloudEnabled = data.cloud_enabled || false;
    const bucket = data.bucket || "";

    // Update GCS status badge
    const badge = document.getElementById("gcs-status-badge");
    const bucketLabel = document.getElementById("gcs-bucket-label");
    if (badge) {
        if (cloudEnabled && bucket) {
            badge.textContent = "GCS: Connected";
            badge.style.background = "rgba(34,197,94,0.15)";
            badge.style.color = "#22c55e";
        } else {
            badge.textContent = "GCS: Disabled";
            badge.style.background = "rgba(100,100,100,0.2)";
            badge.style.color = "var(--text-muted)";
        }
    }
    if (bucketLabel) bucketLabel.textContent = bucket || "not configured";

    const countLabel = document.getElementById("backup-count-label");
    if (countLabel) countLabel.textContent = `${backups.length} snapshot${backups.length !== 1 ? "s" : ""} in cloud`;

    renderBackupList(backups);
}

function renderBackupList(backups) {
    const container = document.getElementById("backup-list");
    const emptyEl = document.getElementById("backup-empty");
    if (!container) return;
    if (backups.length === 0) {
        container.innerHTML = "";
        emptyEl?.classList.add("show");
        return;
    }
    emptyEl?.classList.remove("show");
    const frag = document.createDocumentFragment();
    backups.forEach((b) => {
        const div = document.createElement("div");
        div.className = "backup-entry";
        const created = b.created_at ? new Date(b.created_at).toLocaleString() : "—";
        const isCloud = b.cloud !== false;
        const cloudBadge = isCloud
            ? `<span style="background:rgba(141,92,252,0.2);color:#8D5CFC;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;margin-left:6px;vertical-align:middle">☁ GCS</span>`
            : `<span style="background:rgba(100,100,100,0.15);color:var(--text-muted);font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;margin-left:6px">LOCAL</span>`;

        const gcsUri = b.gcs_uri
            ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px;font-family:monospace;opacity:0.8">${escHtml(b.gcs_uri)}</div>`
            : "";
        const warnBadge = b.warn_large
            ? `<span class="backup-warn">⚠ Large</span>`
            : "";

        div.innerHTML = `
          <div class="backup-info" style="flex:1;min-width:0">
            <div class="backup-name">${escHtml(b.name || b.id)}${cloudBadge}</div>
            <div class="backup-meta">${created} · ${escHtml(b.size_human || "?")} · ${escHtml(b.source || "Cloud (GCS)")}${warnBadge}</div>
            ${gcsUri}
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="btn-sm" data-action="restore" data-id="${escAttr(b.id || b.object_name)}" title="Download &amp; restore">Restore</button>
            ${isCloud ? `<button class="btn-sm" style="color:#ef4444;border-color:rgba(239,68,68,0.3)" data-action="delete-cloud" data-id="${escAttr(b.object_name || b.id)}" title="Delete from GCS">Delete</button>` : ""}
          </div>
        `;
        frag.appendChild(div);
    });
    container.innerHTML = "";
    container.appendChild(frag);
}

// Backup event delegation — handles restore and delete-cloud
document.getElementById("backup-list").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!id) return;

    if (action === "restore") {
        appendBackupLog(`Downloading & restoring: ${id}…`);
        showToast("Downloading from GCS…", "warning");
        const res = await api("POST", `/backup/restore/${encodeURIComponent(id)}`);
        if (res.ok) {
            appendBackupLog(`Restored → ${res.data.path}`);
            showToast(`Restored to ${res.data.path}`, "success");
        } else {
            appendBackupLog(`Restore failed: ${res.data?.detail || "error"}`);
            showToast(res.data?.detail || "Restore failed.", "error");
        }
    }

    if (action === "delete-cloud") {
        if (!confirm(`Delete snapshot "${id}" from GCS? This cannot be undone.`)) return;
        appendBackupLog(`Deleting from GCS: ${id}…`);
        const res = await api("DELETE", `/backup/cloud/${encodeURIComponent(id)}`);
        if (res.ok) {
            appendBackupLog(`Deleted from GCS: ${id}`);
            showToast("Snapshot deleted from cloud.", "success");
            refreshBackupList();
        } else {
            appendBackupLog(`Delete failed: ${res.data?.detail || "error"}`);
            showToast(res.data?.detail || "Delete failed.", "error");
        }
    }
});

document.getElementById("backup-create-btn").addEventListener("click", async () => {
    const pathVal = document.getElementById("backup-path-input").value.trim();
    const nameVal = document.getElementById("backup-name-input").value.trim();
    const statusEl = document.getElementById("backup-status");
    if (!pathVal) {
        statusEl.className = "backup-status error";
        statusEl.textContent = "Please enter a directory path.";
        return;
    }
    statusEl.className = "backup-status";
    statusEl.textContent = "Zipping and uploading to GCS…";
    const res = await api("POST", "/backup/create", { path: pathVal, name: nameVal || undefined });
    if (res.ok) {
        const b = res.data.backup;
        const uploaded = b.gcs_uri
            ? `☁ Uploaded → ${b.gcs_uri}`
            : (res.data.cloud_error ? `⚠ Local only — GCS error: ${res.data.cloud_error}` : "Local only");
        statusEl.className = "backup-status success";
        statusEl.textContent = `✓ ${b.name} (${b.size_human}) — ${uploaded}`;
        appendBackupLog(`Created: ${b.name} (${b.size_human}) ${b.gcs_uri ? "→ " + b.gcs_uri : "[local only]"}`);
        refreshBackupList();
    } else {
        statusEl.className = "backup-status error";
        statusEl.textContent = res.data?.detail || "Snapshot failed.";
    }
});

async function gcsTest() {
    const badge = document.getElementById("gcs-status-badge");
    if (badge) { badge.textContent = "Testing…"; badge.style.color = "var(--text-muted)"; }
    const res = await api("GET", "/backup/gcs-test");
    if (res.ok && res.data.ok) {
        if (badge) {
            badge.textContent = "GCS: Connected";
            badge.style.background = "rgba(34,197,94,0.15)";
            badge.style.color = "#22c55e";
        }
        const loc = document.getElementById("gcs-location-label");
        if (loc) loc.textContent = res.data.message || "";
        appendBackupLog(`GCS connection OK: ${res.data.message}`);
        showToast(res.data.message, "success");
    } else {
        if (badge) {
            badge.textContent = "GCS: Error";
            badge.style.background = "rgba(239,68,68,0.15)";
            badge.style.color = "#ef4444";
        }
        const msg = res.data?.message || "Connection failed";
        appendBackupLog(`GCS error: ${msg}`);
        showToast(msg, "error");
    }
}

document.getElementById("backup-refresh-btn").addEventListener("click", refreshBackupList);
document.getElementById("gcs-test-btn")?.addEventListener("click", gcsTest);

// ─── Folder Picker Buttons ─────────────────────────────────────────────────────
async function browseFolder(targetInputId) {
    const path = await window.neonAPI.selectFolder();
    if (path) {
        const input = document.getElementById(targetInputId);
        if (input) input.value = path;
    }
}
document.getElementById("backup-browse-btn")?.addEventListener("click", () => browseFolder("backup-path-input"));
document.getElementById("settings-browse-btn")?.addEventListener("click", () => browseFolder("s-monitor-path"));

function appendBackupLog(msg) {
    const logEl = document.getElementById("backup-log");
    if (!logEl) return;
    logEl.querySelector(".audit-empty")?.remove();
    const div = document.createElement("div");
    div.className = "audit-entry";
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logEl.prepend(div);
}

// ─── AI Analyst ───────────────────────────────────────────────────────────────
const VERDICT_COLORS = {
    RANSOMWARE: { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", text: "#ef4444", icon: "🔴" },
    SUSPICIOUS: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", text: "#f59e0b", icon: "⚠️" },
    BENIGN: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22c55e", icon: "✅" },
    UNKNOWN: { bg: "rgba(100,100,100,0.12)", border: "rgba(100,100,100,0.25)", text: "#888", icon: "❓" },
};

let _aiLastVerdictCount = 0;
let _aiLastNotifCount = 0;  // tracks confirmed threat notifications (post-filter)
let _aiPollTimer = null;
let _aiGlobalNotifTimer = null;  // polls /ai/notifications even when not on AI page

async function checkAIStatus() {
    const res = await api("GET", "/ai/status");
    const dot = document.getElementById("ai-status-dot");
    const label = document.getElementById("ai-status-label");
    if (!dot || !label) return;
    if (res.ok && res.data.available) {
        dot.style.background = "#22c55e";
        label.textContent = `${res.data.model} · Active — auto-analyzing flagged processes`;
        label.style.color = "#22c55e";
    } else {
        dot.style.background = "#ef4444";
        const msg = (res.data?.message || "Unavailable").slice(0, 80);
        label.textContent = `AI: ${msg}`;
        label.style.color = "#ef4444";
    }
}

// ─── Global notification poller (runs always, not just on AI page) ─────────────
async function pollAINotifications() {
    const res = await api("GET", "/ai/notifications?limit=20");
    if (!res.ok) return;
    const notifs = res.data.notifications || [];
    if (notifs.length > _aiLastNotifCount && _aiLastNotifCount >= 0) {
        const newOnes = notifs.slice(0, notifs.length - _aiLastNotifCount);
        newOnes.forEach((n) => {
            if (n.verdict === "BENIGN") return; // shouldn't appear but guard anyway
            const vc = VERDICT_COLORS[n.verdict] || VERDICT_COLORS.UNKNOWN;
            const proc = n.binary ? ` · ${n.binary}` : "";
            const pid = n.pid ? ` (PID ${n.pid})` : "";
            showToast(
                `${vc.icon} AI: ${n.verdict}${proc}${pid} — ${(n.reason || "").slice(0, 90)}`,
                n.verdict === "RANSOMWARE" ? "error" : "warning"
            );
        });
    }
    _aiLastNotifCount = notifs.length;
}

async function refreshAIVerdicts() {
    const res = await api("GET", "/ai/verdicts?limit=50");
    if (!res.ok) return;
    const verdicts = res.data.verdicts || [];
    _aiLastVerdictCount = verdicts.length;

    const feed = document.getElementById("ai-verdict-feed");
    const emptyEl = document.getElementById("ai-verdict-empty");
    const countEl = document.getElementById("ai-verdict-count");
    if (!feed) return;

    if (countEl) {
        const confirmed = verdicts.filter(v => v.verdict !== "BENIGN").length;
        const cleared = verdicts.filter(v => v.verdict === "BENIGN").length;
        countEl.textContent = `${verdicts.length} total · ${confirmed} threats · ${cleared} false-positives cleared`;
    }

    if (verdicts.length === 0) {
        feed.innerHTML = "";
        emptyEl?.classList.add("show");
        return;
    }
    emptyEl?.classList.remove("show");
    feed.innerHTML = "";

    verdicts.forEach((v) => {
        const vc = VERDICT_COLORS[v.verdict] || VERDICT_COLORS.UNKNOWN;
        const ts = v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : "";
        const indicators = (v.indicators || []).map(i => `<li style="color:var(--text-muted);font-size:12px">${escHtml(i)}</li>`).join("");
        const procPart = v.binary ? `<span style="font-size:11px;color:var(--text-muted);margin-left:8px">PID ${v.pid || "?"} · ${escHtml(v.binary)}</span>` : "";
        const processType = v.process_type ? `<span style="font-size:11px;padding:1px 7px;border-radius:4px;background:rgba(141,92,252,0.15);color:#8D5CFC;margin-left:6px">${escHtml(v.process_type)}</span>` : "";
        const autoBadge = v.auto_detected ? `<span style="font-size:10px;padding:1px 6px;border-radius:4px;background:rgba(34,197,94,0.12);color:#22c55e;margin-left:6px">AUTO</span>` : "";
        const benignNote = v.verdict === "BENIGN" ? `<span style="font-size:10px;padding:1px 6px;border-radius:4px;background:rgba(34,197,94,0.1);color:#22c55e;margin-left:6px">✓ False Positive Cleared</span>` : "";

        const card = document.createElement("div");
        card.style.cssText = `background:${vc.bg};border:1px solid ${vc.border};border-radius:10px;padding:14px 16px`;
        card.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">
            <span style="font-size:11px;font-weight:800;padding:3px 10px;border-radius:5px;background:${vc.border};color:${vc.text};letter-spacing:1px">${v.verdict}</span>
            <span style="font-size:12px;color:var(--text-muted);font-weight:600">Confidence: ${v.confidence ?? '?'}%</span>
            ${procPart}${processType}${autoBadge}${benignNote}
            <span style="font-size:11px;color:var(--text-muted);margin-left:auto">${ts}</span>
          </div>
          <p style="font-size:13px;color:var(--text-primary);margin:0 0 6px">${escHtml(v.reason || "")}</p>
          <p style="font-size:12px;color:#8D5CFC;margin:0 0 6px">💡 ${escHtml(v.recommendation || "")}</p>
          ${indicators ? `<ul style="margin:6px 0 0;padding-left:16px;list-style:disc">${indicators}</ul>` : ""}
          ${v.risk_score !== undefined ? `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Risk: ${v.risk_score}/100 · State: ${v.threat_state || ""} · ${escHtml(v.model || "")}</div>` : ""}
        `;
        feed.appendChild(card);
    });
}

// Optional manual deep-dive: user enters any PID for on-demand analysis
async function analyzeProcessByPid() {
    const pidStr = document.getElementById("ai-pid-input")?.value.trim();
    const pid = parseInt(pidStr, 10);
    const statusEl = document.getElementById("ai-pid-status");
    const resultEl = document.getElementById("ai-process-result");
    if (!pid || isNaN(pid)) { if (statusEl) statusEl.textContent = "Enter a valid PID."; return; }
    if (statusEl) statusEl.textContent = "Analyzing with Gemini…";
    if (resultEl) resultEl.innerHTML = "";

    const res = await api("POST", "/ai/analyze-process", { pid });
    if (statusEl) statusEl.textContent = "";
    if (!res.ok) {
        if (resultEl) resultEl.innerHTML = `<p style="color:#ef4444;font-size:13px">Error: ${escHtml(res.data?.detail || "Analysis failed")}</p>`;
        return;
    }
    const v = res.data;
    const vc = VERDICT_COLORS[v.verdict] || VERDICT_COLORS.UNKNOWN;
    const indicators = (v.indicators || []).map(i => `<li style="color:var(--text-muted);font-size:12px">${escHtml(i)}</li>`).join("");
    const benignMsg = v.verdict === "BENIGN"
        ? `<p style="font-size:12px;color:#22c55e;margin:6px 0 0">✓ This process is a false positive — it has been removed from the suspicious list.</p>` : "";

    if (resultEl) resultEl.innerHTML = `
      <div style="background:${vc.bg};border:1px solid ${vc.border};border-radius:10px;padding:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
          <span style="font-size:12px;font-weight:800;padding:3px 12px;border-radius:5px;background:${vc.border};color:${vc.text};letter-spacing:1px">${v.verdict}</span>
          <span style="font-size:12px;color:var(--text-muted)">PID ${v.pid} · ${escHtml(v.binary || "")} · Confidence ${v.confidence ?? '?'}%</span>
          ${v.process_type ? `<span style="font-size:11px;padding:2px 8px;border-radius:4px;background:rgba(141,92,252,0.15);color:#8D5CFC">${escHtml(v.process_type)}</span>` : ""}
        </div>
        <p style="font-size:13px;margin:0 0 6px">${escHtml(v.reason || "")}</p>
        <p style="font-size:12px;color:#8D5CFC;margin:0 0 6px">💡 ${escHtml(v.recommendation || "")}</p>
        ${indicators ? `<ul style="margin:4px 0 0;padding-left:16px;list-style:disc">${indicators}</ul>` : ""}
        ${benignMsg}
      </div>`;

    showToast(`${vc.icon} PID ${pid}: ${v.verdict} — ${(v.reason || "").slice(0, 70)}`,
        v.verdict === "BENIGN" ? "success" : "warning");
    refreshAIVerdicts(); // update verdict feed
}

async function generateIncidentSummary() {
    const btn = document.getElementById("ai-summary-btn");
    const statusEl = document.getElementById("ai-summary-status");
    const outputEl = document.getElementById("ai-summary-output");
    const copyBtn = document.getElementById("ai-copy-summary-btn");
    if (btn) btn.disabled = true;
    if (statusEl) statusEl.textContent = "Generating with Gemini…";
    if (outputEl) outputEl.style.display = "none";
    if (copyBtn) copyBtn.style.display = "none";

    const res = await api("POST", "/ai/generate-summary", { include_verdicts: true });
    if (btn) btn.disabled = false;
    if (!res.ok) { if (statusEl) statusEl.textContent = `Error: ${res.data?.detail || "Failed"}`; return; }
    const report = res.data;
    if (statusEl) statusEl.textContent = `✓ Generated · Severity: ${report.severity || "?"}`;
    if (outputEl) { outputEl.style.display = "block"; outputEl.textContent = report.summary_markdown || ""; }
    if (copyBtn) {
        copyBtn.style.display = "inline-flex";
        copyBtn.onclick = () => { navigator.clipboard.writeText(report.summary_markdown || ""); showToast("Report copied to clipboard.", "success"); };
    }
}

function startAIPoll() {
    if (_aiPollTimer) return;
    _aiPollTimer = setInterval(() => { refreshAIVerdicts(); pollAINotifications(); }, 5000);
}
function stopAIPoll() {
    if (_aiPollTimer) { clearInterval(_aiPollTimer); _aiPollTimer = null; }
}

// Global notification poll — runs always regardless of active page
function startGlobalAINotifPoll() {
    if (_aiGlobalNotifTimer) return;
    _aiGlobalNotifTimer = setInterval(pollAINotifications, 8000);
}
startGlobalAINotifPoll();

document.getElementById("nav-ai")?.addEventListener("click", () => {
    checkAIStatus();
    refreshAIVerdicts();
    startAIPoll();
});
document.querySelectorAll(".nav-item:not(#nav-ai)").forEach(btn => btn.addEventListener("click", stopAIPoll));
document.getElementById("ai-refresh-btn")?.addEventListener("click", () => { refreshAIVerdicts(); pollAINotifications(); });
document.getElementById("ai-analyze-pid-btn")?.addEventListener("click", analyzeProcessByPid);
document.getElementById("ai-summary-btn")?.addEventListener("click", generateIncidentSummary);

// ─── Timeline ─────────────────────────────────────────────────────────────────
async function refreshTimeline() {
    const res = await api("GET", "/timeline?limit=100");
    if (!res.ok) return;
    const feed = document.getElementById("timeline-feed");
    if (!feed) return;
    const events = res.data.events || [];
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
        const color = { AUTO_CONTAINMENT: "#ef4444", STATE_CHANGE: "#8D5CFC", ESCALATION: "#f59e0b" }[evt.action] || "#22c55e";
        div.innerHTML = `
      <div class="timeline-dot dot-${state}"></div>
      <div class="timeline-body">
        <div class="timeline-action" style="color:${color}">${escHtml(evt.action || "EVENT")}</div>
        <div class="timeline-details">State: <strong>${state}</strong> · Risk: <strong>${evt.risk ?? 0}</strong> · Entropy: ${evt.entropy ?? 0} · Burst: ${evt.burst ?? 0}</div>
      </div>
      <div class="timeline-time">${time}</div>
    `;
        frag.appendChild(div);
    });
    feed.innerHTML = "";
    feed.appendChild(frag);
}

// ─── Settings ─────────────────────────────────────────────────────────────────
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
document.getElementById("s-risk-threshold").addEventListener("input", (e) => {
    document.getElementById("s-risk-threshold-val").textContent = e.target.value;
});
document.getElementById("s-entropy-threshold").addEventListener("input", (e) => {
    document.getElementById("s-entropy-threshold-val").textContent = parseFloat(e.target.value).toFixed(1);
});
document.getElementById("s-auto-containment").addEventListener("click", () => {
    autoContainmentVal = !autoContainmentVal;
    updateAutoContainmentBtn(autoContainmentVal);
});
function updateAutoContainmentBtn(val) {
    document.getElementById("s-auto-containment").classList.toggle("active", val);
    document.getElementById("s-auto-containment-label").textContent = val ? "Enabled" : "Disabled";
}
document.getElementById("settings-save-btn").addEventListener("click", async () => {
    const path = document.getElementById("s-monitor-path").value.trim();
    const risk = parseInt(document.getElementById("s-risk-threshold").value);
    const entropy = parseFloat(document.getElementById("s-entropy-threshold").value);
    const statusEl = document.getElementById("save-status");
    if (!path) { statusEl.className = "save-status error"; statusEl.textContent = "Monitor path required."; return; }
    statusEl.className = "save-status"; statusEl.textContent = "Saving…";
    const res = await api("POST", "/config/update", { monitor_path: path, risk_threshold: risk, entropy_threshold: entropy, auto_containment: autoContainmentVal });
    statusEl.className = res.ok ? "save-status success" : "save-status error";
    statusEl.textContent = res.ok ? "✓ Saved successfully." : (res.data?.detail || "Save failed.");
    setTimeout(() => { statusEl.textContent = ""; }, 3000);
});

// ─── Processes Page Toolbar Wiring ────────────────────────────────────────────
// These use addEventListener (not inline onclick) — required by CSP.
document.getElementById("proc-refresh-btn")?.addEventListener("click", refreshProcesses);
document.getElementById("proc-clear-flags-btn")?.addEventListener("click", clearAllProcesses);
document.getElementById("proc-search")?.addEventListener("input", renderAllProcesses);
document.getElementById("proc-flagged-only")?.addEventListener("change", renderAllProcesses);

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = "success") {
    let el = document.getElementById("ng-toast");
    if (!el) {
        el = document.createElement("div");
        el.id = "ng-toast";
        document.body.appendChild(el);
        Object.assign(el.style, {
            position: "fixed", bottom: "28px", right: "28px", zIndex: "9999",
            padding: "12px 20px", borderRadius: "10px",
            fontFamily: "var(--font, sans-serif)", fontSize: "13px", fontWeight: "600",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            transition: "all 0.3s ease", opacity: "0", transform: "translateY(10px)",
        });
    }
    const c = {
        success: ["rgba(34,197,94,.15)", "#22c55e", "rgba(34,197,94,.3)"],
        warning: ["rgba(245,158,11,.15)", "#f59e0b", "rgba(245,158,11,.3)"],
        error: ["rgba(239,68,68,.15)", "#ef4444", "rgba(239,68,68,.3)"]
    }[type] || ["rgba(34,197,94,.15)", "#22c55e", "rgba(34,197,94,.3)"];
    Object.assign(el.style, { background: c[0], color: c[1], border: `1px solid ${c[2]}` });
    el.textContent = msg;
    requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; });
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(10px)"; }, 4000);
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function escHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escAttr(str) {
    return String(str).replace(/'/g, "\\'");
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
    const res = await api("GET", "/scan/status");
    if (res.ok && res.data.active) {
        isMonitoring = true;
        updateMonitorUI(true);
        startPolling();
    }
    updateDashboard({ risk_score: 0, threat_state: "NORMAL", burst_rate: 0, avg_entropy: 0, suspicious_processes: [] });
}
init();
