"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
	if (k2 === undefined) k2 = k;
	var desc = Object.getOwnPropertyDescriptor(m, k);
	if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		desc = { enumerable: true, get: function () { return m[k]; } };
	}
	Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
	if (k2 === undefined) k2 = k;
	o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
	Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
	o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
	var ownKeys = function (o) {
		ownKeys = Object.getOwnPropertyNames || function (o) {
			var ar = [];
			for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
			return ar;
		};
		return ownKeys(o);
	};
	return function (mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
		__setModuleDefault(result, mod);
		return result;
	};
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
function createWindow() {
	const mainWindow = new electron_1.BrowserWindow({
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
	}
	else {
		mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
	}
}
let pythonProcess = null;
function startPythonServer() {
	const projectRoot = path.resolve(__dirname, '../../');
	const pythonPath = path.join(projectRoot, 'env', 'bin', 'python');
	const scriptPath = path.join(projectRoot, 'main.py');
	console.log(`Starting Python server: ${pythonPath} ${scriptPath}`);
	pythonProcess = (0, child_process_1.spawn)(pythonPath, [scriptPath]);
	pythonProcess.stdout.on('data', (data) => {
		console.log(`Python stdout: ${data}`);
	});
	pythonProcess.stderr.on('data', (data) => {
		console.error(`Python stderr: ${data}`);
	});
	pythonProcess.on('close', (code) => {
		console.log(`Python process exited with code ${code}`);
	});
}
electron_1.app.whenReady().then(() => {
	startPythonServer();
	createWindow();
	electron_1.app.on('activate', function () {
		if (electron_1.BrowserWindow.getAllWindows().length === 0)
			createWindow();
	});
});
electron_1.app.on('window-all-closed', function () {
	if (process.platform !== 'darwin')
		electron_1.app.quit();
});
electron_1.app.on('will-quit', () => {
	if (pythonProcess) {
		pythonProcess.kill();
	}
});

electron_1.ipcMain.handle('read-file', async (event, filePath) => {
	try {
		return fs.readFileSync(filePath, 'utf8');
	}
	catch (error) {
		console.error('Error reading file:', error);
		throw error;
	}
});
electron_1.ipcMain.handle('save-gcode', async (event, gcode) => {
	const { filePath } = await electron_1.dialog.showSaveDialog({
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
		}
		catch (error) {
			console.error('Error saving file:', error);
			return { success: false, error: error.message };
		}
	}
	return { success: false, error: 'Cancelled' };
});
