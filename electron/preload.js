"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("neonAPI", {
    /**
     * Make an API call to the backend through the main process.
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {string} endpoint - API endpoint path e.g. '/metrics'
     * @param {object|null} body - Optional request body
     */
    call: (method, endpoint, body = null) =>
        ipcRenderer.invoke("api-call", { method, endpoint, body }),
});
