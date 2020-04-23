import {Utils} from './Utils';

const HIDDEN_ATTR: string = 'hidden';

enum CssClass {
  CONTENT = 'content',
  HEADER = 'header__frame',
  NO_JS = 'content--no-js',
}

/**
 * Primary class that renders, sets up, and controls the overall app.
 */
class App {
  private observer_: MutationObserver;
  private startYear_: string;
  private utils_: Utils;

  constructor(startYear: string) {
    this.startYear_ = startYear || '';
    this.utils_ = new Utils();
    this.observer_ = new MutationObserver(() => this.setVisibility_());
  }

  /**
   * Renders all elements into the DOM.
   */
  public init(): void {
    this.utils_.init();
    this.updateHeader_();
    this.updateContent_();
    this.updateCopyright_();
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
      <info-panel class="info-panel" id="info-panel" target="info-toggle" hidden></info-panel>\
    `;
    contentEl.innerHTML = contentHtml.replace(/\s\s/g, '');
  }

  /**
   * Injects a custom element into the header element.
   */
  private updateHeader_(): void {
    const headerEl = document.querySelector(`.${CssClass.HEADER}`);
    headerEl.innerHTML += '<info-toggle class="info-toggle" id="info-toggle" target="info-panel"></info-toggle>';
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

  // TODO: Relocate setVisibility_ to a custom element. 
  /**
   * Hides elements if an observed element is hidden since there's no target
   * for the expandable to expand/collapse.
   */
  private setVisibility_(): void {
    const source = document.querySelector('.results');
    const targets = document.querySelectorAll('.expandable');

    if (source.hasAttribute(HIDDEN_ATTR)) {
      targets.forEach((target) => target.setAttribute(HIDDEN_ATTR, ''));
    } else {
      targets.forEach((target) => target.removeAttribute(HIDDEN_ATTR));
    }

    this.observer_.observe(source, {attributes: true});
  }
}

export {App};
