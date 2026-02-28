const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Normally IPC calls go here, but for REST we can use fetch natively in the renderer.
    // We expose a safe API if we need explicit OS bindings, but the spec says:
    // "Sanitize all backend responses"
    // "Use preload bridge"
    // "Buttons must call API endpoints" (using fetch)

    // We can expose fetch wrappers, though native fetch works in renderer.
    // Let's expose some logging utilities and a window state wrapper just in case.
    log: (message) => console.log(`[Renderer]: ${message}`),
});
