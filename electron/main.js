"use strict";
// PROMETHEUS — Behavioral Ransomware Detection Console

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// ─── Single Instance Lock ────────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
    process.exit(0);
}

// ─── Constants ───────────────────────────────────────────────────────────────────
const PROJECT_ROOT = path.resolve(__dirname, "..");
const BACKEND_PORT = 8000;
const BACKEND_HOST = "127.0.0.1";
const BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

// ─── Detect Python ───────────────────────────────────────────────────────────────
function detectPython() {
    const venvPython = path.join(PROJECT_ROOT, "venv", "bin", "python");
    if (fs.existsSync(venvPython)) {
        return venvPython;
    }
    // Fallback to system python3
    return "python3";
}

// ─── Backend Process ─────────────────────────────────────────────────────────────
let backendProcess = null;
let mainWindow = null;

function startBackend() {
    const pythonBin = detectPython();
    console.log(`[PROMETHEUS] Using Python: ${pythonBin}`);

    // Use python -m uvicorn to avoid direct uvicorn binary assumption
    backendProcess = spawn(
        pythonBin,
        ["-m", "uvicorn", "api.server:app", "--host", BACKEND_HOST, "--port", String(BACKEND_PORT), "--no-access-log"],
        {
            cwd: PROJECT_ROOT,
            env: { ...process.env, PYTHONPATH: PROJECT_ROOT },
            stdio: ["ignore", "pipe", "pipe"],
        }
    );

    backendProcess.stdout.on("data", (data) => {
        console.log(`[BACKEND] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on("data", (data) => {
        const msg = data.toString().trim();
        if (msg) console.error(`[BACKEND ERR] ${msg}`);
    });

    backendProcess.on("exit", (code, signal) => {
        console.log(`[BACKEND] Exited code=${code} signal=${signal}`);
        backendProcess = null;
    });

    backendProcess.on("error", (err) => {
        console.error(`[BACKEND] Spawn error: ${err.message}`);
    });
}

function killBackend() {
    if (backendProcess) {
        try {
            backendProcess.kill("SIGTERM");
            // Hard kill after 3s if still alive
            setTimeout(() => {
                if (backendProcess) {
                    try { backendProcess.kill("SIGKILL"); } catch (_) { }
                }
            }, 3000);
        } catch (e) {
            console.error("[BACKEND] Kill error:", e.message);
        }
        backendProcess = null;
    }
}

// ─── Wait for Backend ─────────────────────────────────────────────────────────────
async function waitForBackend(maxAttempts = 30) {
    const { net } = require("electron");
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
            const req = net.request(`${BACKEND_URL}/health`);
            const ok = await new Promise((resolve) => {
                req.on("response", (res) => resolve(res.statusCode === 200));
                req.on("error", () => resolve(false));
                req.end();
            });
            if (ok) {
                console.log("[PROMETHEUS] Backend ready.");
                return true;
            }
        } catch (_) { }
    }
    return false;
}

// ─── Create Window ────────────────────────────────────────────────────────────────
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1100,
        minHeight: 700,
        backgroundColor: "#0F0F12",
        title: "PROMETHEUS — Ransomware Detection Console",
        icon: path.join(__dirname, "renderer", "icon.png"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
        frame: true,
        autoHideMenuBar: true,
    });

    mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

// ─── IPC: Proxy API calls from renderer ──────────────────────────────────────────
ipcMain.handle("api-call", async (_event, { method, endpoint, body }) => {
    const { net } = require("electron");
    return new Promise((resolve, reject) => {
        const url = `${BACKEND_URL}${endpoint}`;
        const req = net.request({ method: method || "GET", url });
        if (body) {
            req.setHeader("Content-Type", "application/json");
        }
        let data = "";
        req.on("response", (res) => {
            res.on("data", (chunk) => (data += chunk.toString()));
            res.on("end", () => {
                try {
                    resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ ok: false, status: res.statusCode, data: { error: data } });
                }
            });
        });
        req.on("error", (err) => reject(err));
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
});

// ─── App Lifecycle ────────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
    startBackend();

    const ready = await waitForBackend(40);
    if (!ready) {
        dialog.showErrorBox(
            "PROMETHEUS — Backend Startup Failed",
            "The detection engine backend failed to start.\n\nPlease ensure:\n• venv is activated with required packages\n• Port 8000 is not in use\n• python3 is available"
        );
        app.quit();
        return;
    }

    await createWindow();
});

app.on("second-instance", () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

app.on("window-all-closed", () => {
    killBackend();
    app.quit();
});

app.on("before-quit", () => {
    killBackend();
});

app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
    }
});
