const ENDPOINT = 'https://gauslin.com/api/etc/calories.json';

/**
 * Custom element that renders content fetched from a JSON endpoint
 * along with a button that toggles the rendered content's visibility.
 */
class AppInfo extends HTMLElement {
  private button: HTMLButtonElement;
  private open: boolean;
  private panel: HTMLElement;

  constructor() {
    super();
    this.open = false;
    this.addEventListener('click', this.togglePanel);
    this.addEventListener('keyup', this.handleKey);
  }

  connectedCallback() {
    this.renderButton();
    this.renderPanel();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.togglePanel);
    this.removeEventListener('keyup', this.handleKey);
  }

  private renderButton() {
    this.button = document.createElement('button');
    this.button.ariaExpanded = 'false';
    this.button.ariaLabel = 'About this app';
    this.button.id = 'info-toggle';
    this.button.innerHTML = this.iconTemplate();
    this.button.tabIndex = 0;
    this.button.setAttribute('aria-haspopup', 'true');
    this.button.setAttribute('aria-controls', 'info-panel');
    this.button.setAttribute('pending', '');

    this.appendChild(this.button);
  }

  private iconTemplate(name: string = 'info'): string {
    let elements = `
      <circle cx="12" cy="12" r="12"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M9,10 L12,10 L12,18 M9,18 L15,18"/>
    `;

    if (name === 'close') {
      elements = `<path d="M5,5 L19,19 M5,19 L19,5"/>`;
    }

    const html = `
      <svg class="icon icon--${name}" viewbox="0 0 24 24" aria-hidden="true">
        ${elements}
      </svg>
    `;

    return html;
  }

  private async renderPanel(): Promise<any> {
    try {
      const response = await fetch(ENDPOINT);
      const json = await response.json();

      this.panel = document.createElement('div');
      this.panel.id = 'info-panel';
      this.panel.innerHTML = json.info;
      this.panel.setAttribute('aria-labelledby', 'info-toggle');
      this.panel.setAttribute('hidden', '');

      this.appendChild(this.panel);
      this.button.removeAttribute('pending');
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }

  private togglePanel() {
    if (!this.open) {
      this.openPanel();
    } else {
      this.closePanel();
    }
    this.open = !this.open;
    this.button.ariaExpanded = `${this.open}`;
  }

  private openPanel() {
    this.button.innerHTML = this.iconTemplate('close');

    this.panel.removeAttribute('hidden');
    window.requestAnimationFrame(() => {
      this.panel.setAttribute('open', '');
    });
  }

  private closePanel() {
    this.button.innerHTML = this.iconTemplate();

    this.panel.removeAttribute('open');
    this.panel.addEventListener('transitionend', () => {
      this.panel.setAttribute('hidden', '');
    }, {once: true});
  }

  private handleKey(event: KeyboardEvent) {
    switch (event.code) {
      case 'Enter':
        this.open = !this.open;
        this.togglePanel();
        break;
      case 'Escape':
        this.open = false;
        this.closePanel();
        break;
    }
  }
}

customElements.define('app-info', AppInfo);
