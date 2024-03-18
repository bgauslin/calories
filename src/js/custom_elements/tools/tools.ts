/**
 * Custom element that updates the DOM and initializes site-wide features.
 */
class Tools extends HTMLElement {
  private hasSetup: boolean;

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.hasSetup) {
      this.setupDom();
      this.hasSetup = true;
    }
  }

  /**
   * Removes 'no JS' stuff from the DOM.
   */
  private setupDom() {
    document.body.classList.remove('no-js');
    document.querySelector('noscript')!.remove();
  }
}

customElements.define('x-tools', Tools);
