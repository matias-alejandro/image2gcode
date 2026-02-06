/// <reference types="vite/client" />
import './style.css'
import './electron.d.ts'
import { GCodeRenderer } from './gcode-preview.ts'
import { SettingsModal } from './components/SettingsModal'
import type { Settings } from './components/SettingsModal'

let selectedFilePath: string | null = null;
let currentGCode: string | null = null;
let currentSettings: Settings = {
	gridSize: 1000,
	gridDivisions: 100,
	zSafetyHeight: 5,
	showConsole: false,
	showGrid: true,
	showAxes: true
};

const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const gcodeCanvas = document.getElementById('gcode-canvas') as HTMLCanvasElement;
const gcodePreviewContainer = document.getElementById('gcode-preview-container') as HTMLDivElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
const outputLog = document.getElementById('output-log') as HTMLDivElement;

const previewLabel = document.getElementById('preview-label') as HTMLDivElement;
previewLabel.textContent = 'Image 2 G-Code ' + __APP_VERSION__;

const appContainer = document.getElementById('app') as HTMLDivElement;

const gcodeRenderer = new GCodeRenderer(gcodeCanvas);
const settingsModal = new SettingsModal(appContainer, currentSettings, (settings: Settings) => {
	currentSettings = settings;
	gcodeRenderer.updateGrid(settings.gridSize, settings.gridDivisions);
	gcodeRenderer.setGridVisibility(settings.showGrid);
	gcodeRenderer.setAxesVisibility(settings.showAxes);

	showConsoleState = settings.showConsole;
	outputLog.style.display = settings.showConsole ? 'block' : 'none';

	log('Settings updated');
});

const handleFileSelect = async (file: File) => {
	const path = window.electronAPI.getPathForFile(file);

	if (!path) {
		log('Error: Could not determine file path. Are you running in browser?', true);
		return;
	}

	selectedFilePath = path;
	log(`Selected: ${path}`);

	if (file.name.toLowerCase().endsWith('.gcode')) {
		gcodePreviewContainer.style.display = 'block';
		log('Loading G-code file...');
		try {
			const gcode = await window.electronAPI.readFile(path);
			currentGCode = gcode;
			gcodeRenderer.render(gcode);
			log('G-code loaded and rendered.');
		} catch (error) {
			log(`Error reading G-code: ${error}`, true);
		}
	} else if (file.type.startsWith('image/')) {
		const reader = new FileReader();
		reader.onload = (e) => {
			if (e.target?.result) {
				triggerConversion();
			}
		};
		reader.readAsDataURL(file);
		log('Image loaded. Starting automatic conversion...');
	} else {
		log('Unsupported file type. Please select an image or a .gcode file.', true);
	}
};

const triggerConversion = async () => {
	if (!selectedFilePath) return;

	loadBtn.disabled = true;
	log('Starting conversion...');

	try {
		const response = await fetch('http://localhost:5000/convert', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				image_path: selectedFilePath,
				z_safety_height: currentSettings.zSafetyHeight
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Server error');
		}

		const result = await response.json();
		log(result.message || 'Conversion successful!');

		if (result.gcode) {
			currentGCode = result.gcode;
			log('Rendering G-code preview...');
			gcodePreviewContainer.style.display = 'block';
			gcodeRenderer.render(result.gcode);
		}
	} catch (error) {
		log(`Error: ${error}`, true);
	} finally {
		loadBtn.disabled = false;
	}
};

let showConsoleState = false;

const log = (message: string, isError = false) => {
	if (showConsoleState || isError) {
		outputLog.style.display = 'block';
	}
	const line = document.createElement('div');
	line.textContent = `> ${message}`;
	if (isError) line.classList.add('error');
	outputLog.appendChild(line);
	outputLog.scrollTop = outputLog.scrollHeight;
};

loadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
	if (fileInput.files?.length) {
		handleFileSelect(fileInput.files[0]);
	}
});

saveBtn.addEventListener('click', async () => {
	if (!currentGCode) {
		log('No G-code to save.', true);
		return;
	}

	log('Opening save dialog...');
	const result = await window.electronAPI.saveGCode(currentGCode);
	if (result.success) {
		log(`G-code saved to: ${result.path}`);
	} else if (result.error !== 'Cancelled') {
		log(`Error saving G-code: ${result.error}`, true);
	}
});

settingsBtn.addEventListener('click', () => {
	settingsModal.show();
});
