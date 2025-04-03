import {LitElement, html} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';

/**
 * Custom element that renders content fetched from a JSON endpoint
 * along with a button that toggles the rendered content's visibility.
 */
@customElements('app-info');
class AppInfo extends HTMLElement {
  private clickListener: EventListenerObject;
  private keyListener: EventListenerObject;

  @query('button' button: HTMLButtonElement;
  @query('.dialog') dialog: HTMLElement;
  @state() open: boolean = false;
  @state() json: any;

  constructor() {
    super();
    this.setAttribute('hidden', ''); // TODO
    this.clickListener = this.togglePanel.bind(this);
    this.keyListener = this.handleKey.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    // this.setup();  // TODO: refactor
    document.addEventListener('click', this.clickListener);
    document.addEventListener('keyup', this.keyListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.clickListener);
    document.removeEventListener('keyup', this.keyListener);
  }

  private async setup(): Promise<any> {
    try {
      const response = await fetch('https://gauslin.com/api/calories.json');
      this.json = await response.json();
      window.requestAnimationFrame(() => this.removeAttribute('hidden'));
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
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
  }

  // TODO: refactor
  private openDialog() {
    this.button.innerHTML = this.iconTemplate('close');
    
    this.dialog.scrollTo(0, 0);
    this.dialog.dataset.open = '';
  }

  // TODO: refactor
  private closeDialog() {
    this.button.innerHTML = this.iconTemplate();
    
    delete this.dialog.dataset.open;
  }

  private handleKey(event: KeyboardEvent) {
    if (event.code === 'Escape' && this.open) {
      this.open = false;
      this.closeDialog();
    }
  }

  protected render() {
    return html`
      <button
        aria-controls="info"
        aria-expanded="${this.open}"
        aria-haspopup="true"
        aria-label="About this app"
        id="toggle"
        type="button">${this.renderIcon()}
      </button>
      <div
        class="dialog"
        aria-labelledby="toggle"
        id="info">
        <article>
          ${this.json.info}
        </article>
      </div>
    `;
  }

  private renderIcon(name: string = 'info'): string {
    let path = 'M9,11 L12,11 L12,18 M9,18 L15,18 M12,12 m11,0 a11,11 0 1,0 -22,0 a11,11 0 1,0 22,0 M11,6 m1,0 a0.5,0.5 0 1,0 -1,0 a0.5,0.5 0 1,0 1,0';

    if (name === 'close') {
      path = 'M5,5 L19,19 M5,19 L19,5';
    }

    return html`
      <svg class="icon icon--${name}" viewbox="0 0 24 24" aria-hidden="true">
        <path d="${path}"/>
      </svg>
    `;
  }
}
