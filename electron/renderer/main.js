const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let tray;
let backendProcess;
let isQuitting = false;

function startBackend() {
    backendProcess = spawn('uvicorn', ['api.server:app', '--host', '127.0.0.1', '--port', '8000'], {
        cwd: path.join(__dirname, '..')
    });

    backendProcess.stdout.on('data', (data) => console.log(`Backend stdout: ${data}`));
    backendProcess.stderr.on('data', (data) => console.error(`Backend stderr: ${data}`));
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 600,
        backgroundColor: '#0F0F12',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        show: false
    });

    // Remove default top menu for a cleaner look
    Menu.setApplicationMenu(null);

    mainWindow.loadFile(path.join(__dirname, 'renderer', 'dashboard.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

function createTray() {
    // Scaffold tray icon logic - create a 16x16 dummy tray icon or use a system empty one
    tray = new Tray(path.join(__dirname, 'icon.png')); // We will ignore missing icon in electron start by catching exceptions or just relying on app 
    try {
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Show Dashboard', click: () => mainWindow.show() },
            { type: 'separator' },
            { label: 'Quit Neon Genesis', click: () => {
                isQuitting = true;
                app.quit();
            }}
        ]);
        tray.setToolTip('Neon Genesis - Threat Dashboard');
        tray.setContextMenu(contextMenu);

        tray.on('click', () => {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        });
    } catch(e) {
        console.error("Tray error:", e);
    }
}

app.whenReady().then(() => {
    startBackend();
    createWindow();
    
    // We will just create a very simple empty 1x1 image for tray if icon missing
    // In actual production, an icon is required.
    try {
        createTray();
    } catch(e) {
        console.log("No icon.png found, skipping tray logic.");
    }
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else {
            mainWindow.show();
        }
    });
});

app.on('before-quit', () => {
    isQuitting = true;
    if (backendProcess) {
        // Kill child process on exit
        const killCmd = process.platform === 'win32' 
            ? spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t'])
            : backendProcess.kill('SIGINT');
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
