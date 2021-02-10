import smoothscroll from 'smoothscroll-polyfill';

const HIDDEN_ATTR: string = 'hidden';
const OPEN_ATTR: string = 'open';
const READY_ATTR: string = 'ready';

/**
 * Custom element that toggles the visibility of its target element.
 */
class InfoToggle extends HTMLElement {
  private button: HTMLButtonElement;
  private buttonTemplate: any;
  private isOpen: boolean;
  private targetEl: Element;
  private iconTemplate: any;

  constructor() {
    super();
    this.isOpen = false;
    this.buttonTemplate = require('./info_toggle_button.pug');
    this.iconTemplate = require('./info_toggle_icon.pug');
    this.addEventListener('click', this.handleClick);
    smoothscroll.polyfill();
  }

  static get observedAttributes(): string[] {
    return [READY_ATTR];
  }

  connectedCallback() {
    this.innerHTML += this.buttonTemplate();
    this.button = this.querySelector('button');    
    this.button.innerHTML = this.iconTemplate({name: 'info'});
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === READY_ATTR) {
      this.targetEl = document.getElementById(this.getAttribute('target'));
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
  }

  /**
   * Toggles an attribute when the button is clicked.
   */
  private handleClick(e: Event) {
    const eventTarget = e.target as HTMLInputElement;
    if (eventTarget === this.button) {
      // Open the info panel.
      if (!this.isOpen) {
        this.button.innerHTML = this.iconTemplate({name: 'close'});
        this.targetEl.removeAttribute(HIDDEN_ATTR);
        window.requestAnimationFrame(() => {
          this.targetEl.setAttribute(OPEN_ATTR, '');
        });
      // Close the info panel.
      } else {
        this.button.innerHTML = this.iconTemplate({name: 'info'});
        this.targetEl.removeAttribute(OPEN_ATTR);
        this.targetEl.addEventListener('transitionend', () => {
          this.targetEl.setAttribute(HIDDEN_ATTR, '');
        }, {once: true});
      }

      document.body.scrollIntoView({behavior: 'smooth'});
      this.isOpen = !this.isOpen;
      this.button.setAttribute('aria-expanded', String(this.isOpen));
    }
  }
}

customElements.define('info-toggle', InfoToggle);
