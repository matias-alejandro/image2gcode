export class SettingsModal {
    private modal: HTMLDivElement;
    private closeBtn: HTMLButtonElement;
    private applyBtn: HTMLButtonElement;
    private gridSizeInput: HTMLInputElement;
    private gridDivisionsInput: HTMLInputElement;
    private onApply: (size: number, divisions: number) => void;

    constructor(container: HTMLElement, onApply: (size: number, divisions: number) => void) {
        this.onApply = onApply;
        this.modal = document.createElement('div');
        this.modal.id = 'settings-modal';
        this.modal.className = 'modal';
        this.modal.innerHTML = `
      <div class="modal-content">
        <h2 style="margin-top: 0; margin-bottom: 1.5rem;">Settings</h2>
        <div class="form-group">
          <label for="grid-size">Grid Size (mm)</label>
          <input type="number" id="grid-size" value="1000" step="10">
        </div>
        <div class="form-group">
          <label for="grid-divisions">Grid Divisions</label>
          <input type="number" id="grid-divisions" value="100">
        </div>
        <div class="modal-actions">
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

        this.initEvents();
    }

    private initEvents() {
        this.closeBtn.addEventListener('click', () => this.hide());
        this.applyBtn.addEventListener('click', () => {
            const size = parseInt(this.gridSizeInput.value);
            const divisions = parseInt(this.gridDivisionsInput.value);

            if (isNaN(size) || isNaN(divisions)) {
                return;
            }

            this.onApply(size, divisions);
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
