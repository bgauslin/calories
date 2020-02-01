import {Utils} from './Utils';

enum CssClass {
  CONTENT = 'content',
  HEADER = 'header__frame',
  NO_JS = 'content--no-js',
}

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
   * Injects custom elements into the header.
   */
  private updateHeader_(): void {
    const headerEl = document.querySelector(`.${CssClass.HEADER}`);
    headerEl.innerHTML += '<app-theme class="themifier"></app-theme>';
  }

  /**
   * Injects custom elements into the content element.
   */
  private updateContent_(): void {
    const contentEl = document.querySelector(`.${CssClass.CONTENT}`);
    contentEl.classList.remove(CssClass.NO_JS);
    contentEl.innerHTML = '<user-values class="user-values"></user-values>';
  }

  /**
   * Updates copyright blurb with current year.
   */
  private updateCopyright_(): void {
    const el = document.querySelector('.copyright__years');
    const currentYear = new Date().getFullYear().toString().substr(-2);
    el.textContent = `© ${this.startYear_}–${currentYear}`;
  }
}

export {App};
