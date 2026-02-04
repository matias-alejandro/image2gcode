import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    getPathForFile: (file: File) => webUtils.getPathForFile(file),
    openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    saveGCode: (gcode: string) => ipcRenderer.invoke('save-gcode', gcode)
});
