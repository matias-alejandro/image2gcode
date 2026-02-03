export interface ElectronAPI {
    getPathForFile: (file: File) => string;
    readFile: (filePath: string) => Promise<string>;
    saveGCode: (gcode: string) => Promise<{ success: boolean, path?: string, error?: string }>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI
    }
}
