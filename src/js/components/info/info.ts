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
  @query('dialog') dialog: HTMLDialogElement;
  @state() inert: boolean = true;
  @state() json: any;
  @state() open: boolean = false;

  constructor() {
    super();
    this.clickListener = this.handleClick.bind(this);
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
    document.removeEventListener('keyup', this.keyListener);
  }

  protected createRenderRoot() {
    return this;
  }

  private async fetchInfo(): Promise<any> {
    try {
      const response = await fetch('calories.json');
      this.json = await response.json();
      this.hidden = false;
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }

  togglePanel() {
    if (this.open) {
      this.inert = true;
      this.dialog.addEventListener('transitionend', () => {
        this.dialog.close();
        this.open = false;
      }, {once: true});
    } else {
      this.inert = false;
      this.dialog.show();
      this.open = true;
    }
  }

  private handleClick(event: Event) {
    const target = event.composedPath()[0];
    if (target === this.button || (target === document.body && this.open)) {
      this.togglePanel();
    }
  }

  private handleKey(event: KeyboardEvent) {
    if (event.code === 'Escape' && this.open) {
      event.preventDefault();
      this.togglePanel();
    }
  }

  protected render() {
    if (!this.json) return;

    const iconPath = this.open ? 'M5,5 L19,19 M5,19 L19,5'  : 'M9,11 L12,11 L12,18 M9,18 L15,18 M12,12 m11,0 a11,11 0 1,0 -22,0 a11,11 0 1,0 22,0 M11,6 m1,0 a0.5,0.5 0 1,0 -1,0 a0.5,0.5 0 1,0 1,0';
    const iconClass = this.open ? 'close' : 'info';
    const label = this.open ? 'Close window' : 'About this app';

    return html`
      <button
        aria-label="${label}"
        id="toggle"
        title="${label}"
        type="button">
        <svg class="icon icon--${iconClass}" viewbox="0 0 24 24" aria-hidden="true">
          <path d="${iconPath}"/>
        </svg>
      </button>

      <dialog
        id="info"
        ?open="${this.open}"
        ?inert="${this.inert}">
        <article>
          ${unsafeHTML(this.json.info)}
        </article>
      </dialog>
    `;
  }
}
