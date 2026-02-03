"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getPathForFile: (file) => electron_1.webUtils.getPathForFile(file),
    openFileDialog: () => electron_1.ipcRenderer.invoke('dialog:openFile'),
    readFile: (filePath) => electron_1.ipcRenderer.invoke('read-file', filePath),
    saveGCode: (gcode) => electron_1.ipcRenderer.invoke('save-gcode', gcode)
});
