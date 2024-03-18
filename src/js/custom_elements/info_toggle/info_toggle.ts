import smoothscroll from 'smoothscroll-polyfill';

const FOR_ATTR = 'for';
const HIDDEN_ATTR = 'hidden';
const OPEN_ATTR = 'open';
const PENDING_ATTR = 'pending';

const BASE_ATTRIBUTES = [
  ['role', 'button'],
  ['aria-haspopup', 'true'],
  ['aria-controls', 'info-panel'],
  ['aria-label', 'About this app'],
  ['aria-expanded', 'false'],
  [PENDING_ATTR, ''],
];

/**
 * Custom element that toggles the visibility of a target element.
 */
class InfoToggle extends HTMLElement {
  private iconTemplate: any;
  private isOpen: boolean;
  private target: HTMLElement;

  constructor() {
    super();
    this.isOpen = false;
    this.iconTemplate = require('./info_toggle_icon.pug');
    this.addEventListener('click', this.togglePanel);
    this.addEventListener('keyup', this.handleKey);
    smoothscroll.polyfill();
  }

  connectedCallback() {
    this.setup();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.togglePanel);
    this.removeEventListener('keyup', this.handleKey);
  }

  private setup() {
    this.target = document.getElementById(this.getAttribute(FOR_ATTR)!)!;
    this.removeAttribute(FOR_ATTR);
    this.tabIndex = 0;

    for (const attribute of BASE_ATTRIBUTES) {
      const [name, value] = attribute;
      this.setAttribute(name, value);
    }
    this.innerHTML = this.iconTemplate({name: 'info'});
  }

  private togglePanel() {
    if (!this.isOpen) {
      this.openPanel();
    } else {
      this.closePanel();
    }
    this.isOpen = !this.isOpen;
    this.ariaExpanded = `${this.isOpen}`;
  }

  private openPanel() {
    this.innerHTML = this.iconTemplate({name: 'close'});
    this.target.removeAttribute(HIDDEN_ATTR);
    window.requestAnimationFrame(() => {
      this.target.setAttribute(OPEN_ATTR, '');
    });
  }

  private closePanel() {
    this.innerHTML = this.iconTemplate({name: 'info'});
    this.target.removeAttribute(OPEN_ATTR);
    this.target.addEventListener('transitionend', () => {
      this.target.setAttribute(HIDDEN_ATTR, '');
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
