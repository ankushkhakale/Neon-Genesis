"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("neonAPI", {
    /**
     * Make an API call to the backend through the main process.
     */
    call: (method, endpoint, body = null) =>
        ipcRenderer.invoke("api-call", { method, endpoint, body }),

    /**
     * Kill a process with elevated privileges using pkexec (shows system password dialog).
     */
    killPrivileged: (pid) =>
        ipcRenderer.invoke("kill-privileged", { pid }),

    /**
     * Open a native OS folder picker dialog.
     * Returns the selected path string, or null if the user cancelled.
     */
    selectFolder: () =>
        ipcRenderer.invoke("select-folder"),
});
