import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { spawn } from 'child_process';
import * as fs from 'fs';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        backgroundColor: '#1a1a1a',
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#1a1a1a',
            symbolColor: '#ffffff'
        }
    });

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

let pythonProcess: any = null;

function startPythonServer() {
    const projectRoot = path.resolve(__dirname, '../../');
    const pythonPath = path.join(projectRoot, 'env', 'bin', 'python');
    const scriptPath = path.join(projectRoot, 'main.py');

    console.log(`Starting Python server: ${pythonPath} ${scriptPath}`);
    pythonProcess = spawn(pythonPath, [scriptPath]);

    pythonProcess.stdout.on('data', (data: any) => {
        console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data: any) => {
        console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code: any) => {
        console.log(`Python process exited with code ${code}`);
    });
}

app.whenReady().then(() => {
    startPythonServer();
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});

ipcMain.handle('read-file', async (event, filePath: string) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
});

ipcMain.handle('save-gcode', async (event, gcode: string) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Save G-Code',
        defaultPath: 'output.gcode',
        filters: [
            { name: 'G-Code Files', extensions: ['gcode'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (filePath) {
        try {
            fs.writeFileSync(filePath, gcode, 'utf8');
            return { success: true, path: filePath };
        } catch (error: any) {
            console.error('Error saving file:', error);
            return { success: false, error: error.message };
        }
    }
    return { success: false, error: 'Cancelled' };
});
