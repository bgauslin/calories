import {LitElement, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

/**
 * Custom element that renders content fetched from a JSON endpoint
 * along with a button that toggles the rendered content's visibility.
 */
@customElement('app-info')
class Info extends LitElement {
  private clickListener: EventListenerObject;
  private keyListener: EventListenerObject;

  @property({reflect: true, type: Boolean}) hidden: boolean = true;
  @query('button') button: HTMLButtonElement;
  @query('.dialog') dialog: HTMLElement; // TODO: <dialog> element
  @state() endpoint: string = 'https://gauslin.com/api/calories.json';
  @state() open: boolean = false;
  @state() json: any; // TODO: type/interface

  constructor() {
    super();
    this.clickListener = this.togglePanel.bind(this);
    this.keyListener = this.handleKey.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.clickListener);
    document.addEventListener('keyup', this.keyListener);
    this.fetchInfo();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.clickListener);
    document.removeEventListener('keyup', this.keyListener);
  }

  protected createRenderRoot() {
    return this;
  }

  private async fetchInfo(): Promise<any> {
    try {
      const response = await fetch(this.endpoint);
      this.json = await response.json();
      this.hidden = false;
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }

  private togglePanel(event: Event) {
    const target = event.target;

    if (target === document.body && this.open) {
      this.open = false;
    }

    if (target !== this.button) {
      return;
    }

    this.open = !this.open;

    if (this.open) {
      this.dialog.scrollTo(0, 0);
    }
  }

  private handleKey(event: KeyboardEvent) {
    if (event.code === 'Escape' && this.open) {
      this.open = false;
    }
  }

  protected render() {
    if (!this.json) return;

    const iconPath = this.open ? 'M5,5 L19,19 M5,19 L19,5'  : 'M9,11 L12,11 L12,18 M9,18 L15,18 M12,12 m11,0 a11,11 0 1,0 -22,0 a11,11 0 1,0 22,0 M11,6 m1,0 a0.5,0.5 0 1,0 -1,0 a0.5,0.5 0 1,0 1,0';
    const iconClass = this.open ? 'close' : 'info';

    return html`
      <button
        aria-controls="info"
        aria-expanded="${this.open}"
        aria-haspopup="true"
        aria-label="About this app"
        id="toggle"
        type="button">
        <svg class="icon icon--${iconClass}" viewbox="0 0 24 24" aria-hidden="true">
          <path d="${iconPath}"/>
        </svg>
      </button>
      <div
        aria-labelledby="toggle"  
        class="dialog"
        id="info"
        ?data-open="${this.open}">
        <article>
          ${unsafeHTML(this.json.info)}
        </article>
      </div>
    `;
  }
}
