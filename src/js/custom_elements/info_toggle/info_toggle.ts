import smoothscroll from 'smoothscroll-polyfill';

const FOR_ATTR: string = 'for';
const HIDDEN_ATTR: string = 'hidden';
const OPEN_ATTR: string = 'open';
const PENDING_ATTR: string = 'pending';

const BASE_ATTRIBUTES = [
  ['role', 'button'],
  ['aria-haspopup', 'true'],
  ['aria-controls', 'info-panel'],
  ['aria-label', 'About this app'],
  ['aria-expanded', 'false'],
  [PENDING_ATTR, ''],
];

/**
 * Custom element that toggles the visibility of its target element.
 */
class InfoToggle extends HTMLElement {
  private iconTemplate: any;
  private isOpen: boolean;
  private target: Element;

  constructor() {
    super();
    this.isOpen = false;
    this.iconTemplate = require('./info_toggle_icon.pug');
    this.addEventListener('click', this.handleClick);
    smoothscroll.polyfill();
  }

  connectedCallback() {
    this.setup();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
  }

  /**
   * Adds a bunch of ARIA attributes to itself and renders its icon.
   */
  private setup() {
    this.target = document.getElementById(this.getAttribute(FOR_ATTR));
    this.removeAttribute(FOR_ATTR);

    for (const attribute of BASE_ATTRIBUTES) {
      const [name, value] = attribute;
      this.setAttribute(name, value);
    }
    this.innerHTML = this.iconTemplate({name: 'info'});
  }

  /**
   * Toggles an attribute when this is clicked.
   */
  private handleClick() {
    // Open the info panel.
    if (!this.isOpen) {
      this.innerHTML = this.iconTemplate({name: 'close'});
      this.target.removeAttribute(HIDDEN_ATTR);
      window.requestAnimationFrame(() => {
        this.target.setAttribute(OPEN_ATTR, '');
      });
    // Close the info panel.
    } else {
      this.innerHTML = this.iconTemplate({name: 'info'});
      this.target.removeAttribute(OPEN_ATTR);
      this.target.addEventListener('transitionend', () => {
        this.target.setAttribute(HIDDEN_ATTR, '');
      }, {once: true});
    }

    document.body.scrollIntoView({behavior: 'smooth'});
    this.isOpen = !this.isOpen;
    this.setAttribute('aria-expanded', String(this.isOpen));
  }
}

customElements.define('info-toggle', InfoToggle);
