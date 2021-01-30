import smoothscroll from 'smoothscroll-polyfill';

const ARIA_EXPANDED_ATTR: string = 'aria-expanded';
const HIDDEN_ATTR: string = 'hidden';
const OPEN_ATTR: string = 'open';
const READY_ATTR: string = 'ready';

const SVG_PATH = new Map();
SVG_PATH.set('close', 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
SVG_PATH.set('info', 'M12 0 C5.373 0 0 5.375 0 12 0 18.629 5.373 24 12 24 18.627 24 24 18.629 24 12 24 5.375 18.627 0 12 0 Z M12 5.323 C13.122 5.323 14.032 6.233 14.032 7.355 14.032 8.477 13.122 9.387 12 9.387 10.878 9.387 9.968 8.477 9.968 7.355 9.968 6.233 10.878 5.323 12 5.323 Z M14.71 17.613 C14.71 17.934 14.45 18.194 14.129 18.194 L9.871 18.194 C9.55 18.194 9.29 17.934 9.29 17.613 L9.29 16.452 C9.29 16.131 9.55 15.871 9.871 15.871 L10.452 15.871 10.452 12.774 9.871 12.774 C9.55 12.774 9.29 12.514 9.29 12.194 L9.29 11.032 C9.29 10.712 9.55 10.452 9.871 10.452 L12.968 10.452 C13.288 10.452 13.548 10.712 13.548 11.032 L13.548 15.871 14.129 15.871 C14.45 15.871 14.71 16.131 14.71 16.452 L14.71 17.613 Z');

/**
 * Custom element that toggles the visibility of its target element.
 */
export class InfoToggle extends HTMLElement {
  private button: HTMLButtonElement;
  private isOpen: boolean;
  private targetEl: Element;

  constructor() {
    super();
    this.isOpen = false;
    this.addEventListener('click', this.handleClick);
    smoothscroll.polyfill();
  }

  static get observedAttributes(): string[] {
    return [READY_ATTR];
  }

  connectedCallback() {
    this.renderButton();
    this.renderIcon_('info');
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
    if (eventTarget.classList.contains(`${this.className}__button`)) {
      // Open the info panel.
      if (!this.isOpen) {
        this.renderIcon_('close');
        this.targetEl.removeAttribute(HIDDEN_ATTR);
        window.requestAnimationFrame(() => {
          this.targetEl.setAttribute(OPEN_ATTR, '');
        });
      // Close the info panel.
      } else {
        this.renderIcon_('info');
        this.targetEl.removeAttribute(OPEN_ATTR);
        this.targetEl.addEventListener('transitionend', () => {
          this.targetEl.setAttribute(HIDDEN_ATTR, '');
        }, {once: true});
      }

      document.body.scrollIntoView({behavior: 'smooth'});
      this.isOpen = !this.isOpen;
      this.button.setAttribute(ARIA_EXPANDED_ATTR, String(this.isOpen));
    }
  }

  /**
   * Renders a button for attribute toggling.
   */
  private renderButton() {
    this.innerHTML += `\
      <button \
        class="${this.className}__button" \
        id="info-toggle" \
        aria-haspopup="true" \
        aria-controls="info-panel" \
        aria-label="About this app" \
        ${ARIA_EXPANDED_ATTR}="false">\
      </button>\
    `;
    this.button = this.querySelector(`.${this.className}__button`);
  }

  /**
   * Renders an icon inside the button.
   */
  private renderIcon_(iconName: string) {
    const html = `\
      <svg \
        class="${this.className}__icon ${this.className}__icon--${iconName}" \
        viewbox="0 0 24 24" aria-hidden="true">\
        <path d="${SVG_PATH.get(iconName)}"/>\
      </svg>\
    `;
    this.button.innerHTML = html.replace(/\s\s/g, '');
  }
}
