const ENDPOINT = 'https://gauslin.com/api/etc/calories.json';

/**
 * Custom element that renders content fetched from a JSON endpoint
 * along with a button that toggles the rendered content's visibility.
 */
class AppInfo extends HTMLElement {
  private button: HTMLButtonElement;
  private clickListener: EventListenerObject;
  private dialog: HTMLElement;
  private keyListener: EventListenerObject;
  private open: boolean;

  constructor() {
    super();
    this.open = false;
    this.clickListener = this.togglePanel.bind(this);
    this.keyListener = this.handleKey.bind(this);
  }

  connectedCallback() {
    this.setup();
    document.addEventListener('click', this.clickListener);
    document.addEventListener('keyup', this.keyListener);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.clickListener);
    document.removeEventListener('keyup', this.keyListener);
  }

  private async setup(): Promise<any> {
    try {
      const response = await fetch(ENDPOINT);
      const json = await response.json();

      this.innerHTML += `
        <button
          aria-controls="info"
          aria-expanded="false"
          aria-haspopup="true"
          aria-label="About this app"
          id="toggle"
          type="button">${this.iconTemplate()}
        </button>
        <div class="dialog" aria-labelledby="toggle" id="info">
          <article>
            ${json.info}
          </article>
        </div>
      `;

      this.dialog = this.querySelector('.dialog')!;
      this.button = this.querySelector('button')!;
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }

  private iconTemplate(name: string = 'info'): string {
    let elements = `
      <circle cx="12" cy="12" r="11"/>
      <circle cx="12" cy="5" r="1.5"/>
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

  private togglePanel(event: Event) {
    const target = event.target;
    if (target === document.body && this.open) {
      this.open = false;
      this.closeDialog();
    }

    if (target !== this.button) {
      return;
    }

    if (!this.open) {
      this.openDialog();
    } else {
      this.closeDialog();
    }
    this.open = !this.open;
    this.button.ariaExpanded = `${this.open}`;
  }

  private openDialog() {
    this.button.innerHTML = this.iconTemplate('close');
    this.button.ariaExpanded = 'true';
    this.dialog.scrollTo(0, 0);
    this.dialog.dataset.open = '';
  }

  private closeDialog() {
    this.button.innerHTML = this.iconTemplate();
    this.button.ariaExpanded = 'false';
    delete this.dialog.dataset.open;
  }

  private handleKey(event: KeyboardEvent) {
    if (event.code === 'Escape' && this.open) {
      this.open = false;
      this.closeDialog();
    }
  }
}

customElements.define('app-info', AppInfo);
