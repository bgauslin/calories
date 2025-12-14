import {LitElement, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {Events} from './shared';


/**
 * Lit custom element that displays content fetched from a JSON endpoint
 * with a button that toggles the content's visibility.
 */
@customElement('calories-info') class Info extends LitElement {
  private clickHandler: EventListenerObject;
  private keyHandler: EventListenerObject;

  @property({reflect: true, type: Boolean}) hidden: boolean = true;
  @query('button') button: HTMLButtonElement;
  @query('dialog') dialog: HTMLDialogElement;
  @state() inert: boolean = true;
  @state() info: string;
  @state() open: boolean = false;

  constructor() {
    super();
    this.clickHandler = this.handleClick.bind(this);
    this.keyHandler = this.handleKey.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(Events.Click, this.clickHandler);
    document.addEventListener(Events.KeyUp, this.keyHandler);
    this.fetchInfo();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(Events.KeyUp, this.keyHandler);
  }

  protected createRenderRoot() {
    return this;
  }

  private async fetchInfo(): Promise<any> {
    try {
      const response = await fetch('info.json');
      const {info} = await response.json();
      this.info = info;
      this.hidden = false;
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }

  private togglePanel() {
    if (this.open) {
      this.inert = true;
      this.dialog.addEventListener(Events.TransitionEnd, () => {
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
    if (!this.info) return;

    const iconPath = !this.inert ? 'M6,6 L18,18 M6,18 L18,6'  : 'M 9,11 L12,11 L12,18 M9,18 L15,18 M12,12 m11,0 M11,6 m1,0 a0.5,0.5 0 1,0 -1,0 a0.5,0.5 0 1,0 1,0';
    const iconClass = !this.inert ? 'close' : 'info';
    const label = !this.inert ? 'Close window' : 'About this app';
    const type = !this.inert ? 'closer' : 'opener';

    return html`
      <button
        aria-label="${label}"
        data-type="${type}"
        id="toggle"
        title="${label}"
        type="button">
        <svg
          aria-hidden="true"  
          class="icon icon--${iconClass}"
          viewBox="0 0 24 24">
          <path d="${iconPath}"/>
        </svg>
      </button>
      <dialog
        id="info"
        ?inert=${this.inert}
        ?open=${this.open}>
        <article>
          ${unsafeHTML(this.info)}
        </article>
      </dialog>
    `;
  }
}
