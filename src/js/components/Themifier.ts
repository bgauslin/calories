import {Attribute, Theme} from '../modules/Constants';

class Themifier extends HTMLElement {
  private theme_: string;

  constructor() {
    super();
    this.addAttributes_();
    this.addEventListener('click', () => this.toggleTheme_());
  }

  connectedCallback(): void {
    this.theme_ = localStorage.getItem(Attribute.THEME) || document.body.getAttribute(Attribute.THEME);
    document.body.setAttribute(Attribute.THEME, this.theme_);

    const html = `\
      <svg class="icon icon--theme" viewbox="0 0 24 24">\
        <path d="M0.375 12 C0.375 18.42 5.58 23.625 12 23.625 18.42 23.625 23.625 18.42 23.625 12 23.625 5.58 18.42 0.375 12 0.375 5.58 0.375 0.375 5.58 0.375 12 Z M12 20.625 L12 3.375 C16.767 3.375 20.625 7.233 20.625 12 20.625 16.767 16.767 20.625 12 20.625 Z"/>\
      </svg>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', null);
  }

  /**
   * Toggles 'theme' attribute on the body element and saves it to localStorage.
   */
  private toggleTheme_(): void {
    this.theme_ = (this.theme_ === Theme.DEFAULT) ? Theme.ALT : Theme.DEFAULT;
    document.body.setAttribute(Attribute.THEME, this.theme_);
    localStorage.setItem(Attribute.THEME, this.theme_);
  }

  /**
   * Adds accessibility attributes to the custom element.
   */
  private addAttributes_(): void {
    const attr = new Map();
    attr.set('title', 'Change theme');
    attr.set('aria-label', 'Change theme');
    attr.set('tabindex', '0');
    attr.forEach((key, value) => this.setAttribute(value, key));
  }
}

export {Themifier};
