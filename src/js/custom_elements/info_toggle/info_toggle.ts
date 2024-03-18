const ENDPOINT = 'https://gauslin.com/api/etc/calories.json';

/**
 * TODO: Update overview...
 * Custom element that toggles the visibility of a target element.
 * Custom element that populates itself with data fetched from a JSON endpoint.
 */
class InfoToggle extends HTMLElement {
  private iconTemplate: any;
  private isOpen: boolean;
  private button: HTMLButtonElement;
  private panel: HTMLElement;

  constructor() {
    super();
    this.isOpen = false;
    this.iconTemplate = require('./info_toggle_icon.pug');
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
    this.button.innerHTML = this.iconTemplate({name: 'info'});
    this.button.tabIndex = 0;
    this.button.setAttribute('aria-haspopup', 'true');
    this.button.setAttribute('aria-controls', 'info-panel');
    this.button.setAttribute('pending', '');

    this.appendChild(this.button);
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

  private togglePanel(event: Event) {
    if (event.target !== this.button) {
      return;
    }

    if (!this.isOpen) {
      this.openPanel();
    } else {
      this.closePanel();
    }
    this.isOpen = !this.isOpen;
    this.button.ariaExpanded = `${this.isOpen}`;
  }

  private openPanel() {
    this.button.innerHTML = this.iconTemplate({name: 'close'});

    this.panel.removeAttribute('hidden');
    window.requestAnimationFrame(() => {
      this.panel.setAttribute('open', '');
    });
  }

  private closePanel() {
    this.button.innerHTML = this.iconTemplate({name: 'info'});

    this.panel.removeAttribute('open');
    this.panel.addEventListener('transitionend', () => {
      this.panel.setAttribute('hidden', '');
    }, {once: true});
  }

  private handleKey(event: KeyboardEvent) {
    switch (event.code) {
      case 'Enter':
        this.togglePanel();
        break;
      case 'Escape':
        this.isOpen = false;
        this.closePanel();
        break;
    }
  }
}

customElements.define('info-toggle', InfoToggle);
