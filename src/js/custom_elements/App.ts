import {Utils} from '../modules/Utils';

const CONTENT_SELECTOR: string = '.content';
const COPYRIGHT_SELECTOR: string = '.copyright__years';
const NO_JS_CLASS: string = 'content--no-js';
const YEAR_ATTR: string = 'year';

/**
 * Custom element that initializes site-wide utilities, cleans up content,
 * and updates the copyright years.
 */
class App extends HTMLElement {
  constructor() {
    super();
    new Utils().init();
  }

  connectedCallback(): void {
    this.updateContent_();
    this.updateCopyright_();
  }

  /**
   * Removes no-js class and <noscript> element from content.
   */
  private updateContent_(): void {
    const contentEl = document.querySelector(CONTENT_SELECTOR);
    contentEl.classList.remove(NO_JS_CLASS);
    contentEl.querySelector('noscript').remove();
  }

  /**
   * Updates copyright years with the current year.
   */
  private updateCopyright_(): void {
    const startYear = this.getAttribute(YEAR_ATTR);
    const currentYear = new Date().getFullYear().toString();

    const startDecade = startYear.substr(-2);
    const currentDecade = currentYear.substr(-2);

    const el = document.querySelector(COPYRIGHT_SELECTOR);
    el.textContent = (startDecade !== currentDecade) ? `© ${startYear}–${currentDecade}` : `© ${startYear}`;

    this.removeAttribute(YEAR_ATTR);
  }
}

export {App};
