export interface Settings {
  gridSize: number;
  gridDivisions: number;
  showConsole: boolean;
  showGrid: boolean;
  showAxes: boolean;
  zSafetyHeight: number;
}

export class SettingsModal {
  private modal: HTMLDivElement;
  private closeBtn: HTMLButtonElement;
  private applyBtn: HTMLButtonElement;
  private gridSizeInput: HTMLInputElement;
  private gridDivisionsInput: HTMLInputElement;
  private showConsoleInput: HTMLInputElement;
  private showGridInput: HTMLInputElement;
  private showAxesInput: HTMLInputElement;
  private zSafetyHeightInput: HTMLInputElement;
  private onApply: (settings: Settings) => void;

  constructor(container: HTMLElement, initialSettings: Settings, onApply: (settings: Settings) => void) {
    this.onApply = onApply;
    this.modal = document.createElement('div');
    this.modal.id = 'settings-modal';
    this.modal.className = 'modal';
    this.modal.innerHTML = `
      <div class="modal-content">
        <h2 style="margin-top: 0; margin-bottom: 1.5rem;">Settings</h2>
        
        <div class="form-group">
          <label for="grid-size">Grid Size (mm)</label>
          <input type="number" id="grid-size" value="${initialSettings.gridSize}" step="10">
        </div>
        
        <div class="form-group">
          <label for="grid-divisions">Grid Divisions</label>
          <input type="number" id="grid-divisions" value="${initialSettings.gridDivisions}">
        </div>

        <div class="switch-group">
          <label for="show-console">Show Console</label>
          <label class="switch">
            <input type="checkbox" id="show-console" ${initialSettings.showConsole ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="switch-group">
          <label for="show-grid">Show Grid</label>
          <label class="switch">
            <input type="checkbox" id="show-grid" ${initialSettings.showGrid ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="switch-group">
          <label for="show-axes">Show Axes</label>
          <label class="switch">
            <input type="checkbox" id="show-axes" ${initialSettings.showAxes ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="form-group">
          <label for="z-safety-height">Z Safety Height (mm)</label>
          <input type="number" id="z-safety-height" value="${initialSettings.zSafetyHeight}" step="1">
        </div>

        <div class="modal-actions" style="margin-top: 1.5rem;">
          <button id="close-settings">Close</button>
          <button id="apply-settings">Apply</button>
        </div>
      </div>
    `;
    container.appendChild(this.modal);

    this.closeBtn = this.modal.querySelector('#close-settings') as HTMLButtonElement;
    this.applyBtn = this.modal.querySelector('#apply-settings') as HTMLButtonElement;
    this.gridSizeInput = this.modal.querySelector('#grid-size') as HTMLInputElement;
    this.gridDivisionsInput = this.modal.querySelector('#grid-divisions') as HTMLInputElement;
    this.showConsoleInput = this.modal.querySelector('#show-console') as HTMLInputElement;
    this.showGridInput = this.modal.querySelector('#show-grid') as HTMLInputElement;
    this.showAxesInput = this.modal.querySelector('#show-axes') as HTMLInputElement;
    this.zSafetyHeightInput = this.modal.querySelector('#z-safety-height') as HTMLInputElement;

    this.initEvents();
  }

  private initEvents() {
    this.closeBtn.addEventListener('click', () => this.hide());
    this.applyBtn.addEventListener('click', () => {
      const size = parseInt(this.gridSizeInput.value);
      const divisions = parseInt(this.gridDivisionsInput.value);
      const zSafetyHeight = parseInt(this.zSafetyHeightInput.value);

      if (isNaN(size) || isNaN(divisions) || isNaN(zSafetyHeight)) {
        return;
      }

      this.onApply({
        gridSize: size,
        gridDivisions: divisions,
        showConsole: this.showConsoleInput.checked,
        showGrid: this.showGridInput.checked,
        showAxes: this.showAxesInput.checked,
        zSafetyHeight: zSafetyHeight,
      });
      this.hide();
    });

    window.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.hide();
      }
    });
  }

  show() {
    this.modal.style.display = 'block';
  }

  hide() {
    this.modal.style.display = 'none';
  }
}
