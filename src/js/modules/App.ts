import {Attribute} from './Constants';
import {Utils} from './Utils';

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
      <user-values class="values" units="imperial" formula="ms"></user-values>\
      ${this.renderTable_('table')}\
      <app-expandable class="expandable" target="table" label="table"></app-expandable>\
    `;
    contentEl.innerHTML = contentHtml.replace(/\s\s/g, '');
  }

  /**
   * Returns rendered table element for displaying zig-zag calories.
   */
  private renderTable_(classname: string, id: string = classname): string {
    const html = `\
      <div class="${classname}" id="${id}">\
        <div class="${classname}__frame">\
          <table class="${classname}__data"></table>\
        </div>\
      </div>\
    `;
    return html.replace(/\s\s/g, '');
  }

  /**
   * Hides elements if an observed element is empty since there's no target
   * for the expandable to expand/collapse.
   */
  private setVisibility_(): void {
    const els = document.querySelectorAll(Visibility.TARGETS);

    if (this.visibilitySourceEl_.hasAttribute(Attribute.EMPTY)) {
      els.forEach((el) => el.setAttribute(Attribute.HIDDEN, ''));
    } else {
      els.forEach((el) => el.removeAttribute(Attribute.HIDDEN));
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
