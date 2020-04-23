import {Utils} from './Utils';

const CONTENT_SELECTOR: string = '.content';
const COPYRIGHT_SELECTOR: string = '.copyright__years';
const HEADER_SELECTOR: string = '.header__frame';
const NO_JS_CLASS: string = 'content--no-js';

/**
 * Primary class that renders, sets up, and controls the overall app.
 */
class App {
  private startYear_: string;
  private utils_: Utils;

  constructor(startYear: string) {
    this.startYear_ = startYear || '';
    this.utils_ = new Utils();
  }

  /**
   * Renders all elements into the DOM.
   */
  public init(): void {
    this.utils_.init();
    this.updateHeader_();
    this.updateContent_();
    this.updateCopyright_();
  }

  /**
   * Injects custom elements into the content element.
   */
  private updateContent_(): void {
    const contentEl = document.querySelector(CONTENT_SELECTOR);
    contentEl.classList.remove(NO_JS_CLASS);
    const contentHtml = `\
      <user-values class="values" units="imperial"></user-values>\
      <zig-zag class="zig-zag"></zig-zag>\
      <info-panel class="info-panel" id="info-panel" target="info-toggle" hidden></info-panel>\
    `;
    contentEl.innerHTML = contentHtml.replace(/\s\s/g, '');
  }

  /**
   * Injects a custom element into the header element.
   */
  private updateHeader_(): void {
    const headerEl = document.querySelector(HEADER_SELECTOR);
    headerEl.innerHTML += '<info-toggle class="info-toggle" id="info-toggle" target="info-panel"></info-toggle>';
  }

  /**
   * Updates copyright blurb with current year.
   */
  private updateCopyright_(): void {
    const el = document.querySelector(COPYRIGHT_SELECTOR);
    const startYear = this.startYear_.toString().substr(-2);
    const currentYear = new Date().getFullYear().toString().substr(-2);
    el.textContent = (currentYear !== startYear) ? `© ${this.startYear_}–${currentYear}` : `© ${this.startYear_}`;
  }
}

export {App};
