import {Utils} from './Utils';

const HIDDEN_ATTR: string = 'hidden';

enum CssClass {
  CONTENT = 'content',
  HEADER = 'header__frame',
  NO_JS = 'content--no-js',
}

enum Visibility {
  SOURCE = '.result',
  TARGETS = '.expandable, .table',
}

class App {
  private observer_: MutationObserver;
  private startYear_: string;
  private utils_: Utils;
  private visibilitySourceEl_: HTMLElement;

  constructor(startYear: string) {
    this.observer_ = new MutationObserver(() => this.setVisibility_());
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
    
    this.visibilitySourceEl_ = document.querySelector(Visibility.SOURCE);
    this.observer_.observe(this.visibilitySourceEl_, {attributes: true});
    this.setVisibility_();
  }

  /**
   * Injects custom elements into the content element.
   */
  private updateContent_(): void {
    const contentEl = document.querySelector(`.${CssClass.CONTENT}`);
    contentEl.classList.remove(CssClass.NO_JS);
    const contentHtml = `\
      <user-values class="values" units="imperial"></user-values>\
      <zig-zag class="zig-zag"></zig-zag>\
    `;
    contentEl.innerHTML = contentHtml.replace(/\s\s/g, '');
  }

  /**
   * Injects a custom element into the header element.
   */
  private updateHeader_(): void {
    const headerEl = document.querySelector(`.${CssClass.HEADER}`);
    headerEl.innerHTML += '<app-info class="info"></app-info>';
  }

  /**
   * Hides elements if an observed element is hidden since there's no target
   * for the expandable to expand/collapse.
   */
  private setVisibility_(): void {
    const els = document.querySelectorAll(Visibility.TARGETS);

    if (this.visibilitySourceEl_.hasAttribute(HIDDEN_ATTR)) {
      els.forEach((el) => el.setAttribute(HIDDEN_ATTR, ''));
    } else {
      els.forEach((el) => el.removeAttribute(HIDDEN_ATTR));
    }
  }

  /**
   * Updates copyright blurb with current year.
   */
  private updateCopyright_(): void {
    const el = document.querySelector('.copyright__years');
    const startYear = this.startYear_.toString().substr(-2);
    const currentYear = new Date().getFullYear().toString().substr(-2);
    el.textContent = (currentYear !== startYear) ? `© ${this.startYear_}–${currentYear}` : `© ${this.startYear_}`;
  }
}

export {App};
