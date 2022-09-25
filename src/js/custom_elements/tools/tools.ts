import fastclick from 'fastclick';

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
      this.touchEnabled();
      this.hasSetup = true;
    }
  }

  /**
   * Removes 'no JS' stuff from the DOM.
   */
  private setupDom() {
    document.body.removeAttribute('no-js');
    document.querySelector('noscript').remove();
  }

  /**
   * Removes 'no-touch' attribute and adds fastclick if device is touch-enabled.
   */
  private touchEnabled() {
    if ('ontouchstart' in window || (window as any).DocumentTouch) {
      document.body.removeAttribute('no-touch');
      fastclick['attach'](document.body);
    }
  }
}

customElements.define('x-tools', Tools);
