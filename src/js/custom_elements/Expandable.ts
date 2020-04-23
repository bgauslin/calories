const EXPANDED_ATTR: string = 'expanded';
const HIDDEN_ATTR: string = 'hidden';
const LABEL_ATTR: string = 'label';
const TARGET_ATTR: string = 'target';
const WATCH_ATTR: string = 'watch';

/**
 * Custom element that expands/collapses its target element.
 */
class Expandable extends HTMLElement {
  private buttonEl_: HTMLElement;
  private hasSetup_: boolean;
  private label_: string;
  private observer_: MutationObserver;
  private targetEl_: HTMLElement;
  private watchEl_: HTMLElement;

  constructor() {
    super();
    this.hasSetup_ = false;
    this.addEventListener('click', this.toggleExpanded_);
    this.observer_ = new MutationObserver(() => this.toggleHidden_());
  }

  static get observedAttributes(): string[] {
    return [EXPANDED_ATTR];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    const direction = (newValue === '') ? 'expand' : 'collapse';
    this.expandCollapse_(direction);
  }

  connectedCallback(): void {
    this.setup_();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.toggleExpanded_);
    this.observer_.disconnect();
  }

  /**
   * Adds a button element to the DOM, and sets initial state of the expandable
   * and related elements.
   */
  private setup_(): void {
    this.label_ = this.getAttribute(LABEL_ATTR);
    this.targetEl_ = document.getElementById(this.getAttribute(TARGET_ATTR));
    this.watchEl_ = document.getElementById(this.getAttribute(WATCH_ATTR));

    if (this.label_ && this.targetEl_ && this.watchEl_) {
      this.observer_.observe(this.watchEl_, {attributes: true});

      if (localStorage.getItem(EXPANDED_ATTR) === 'true') {
        this.setAttribute(EXPANDED_ATTR, '');
        this.targetEl_.setAttribute(EXPANDED_ATTR, '');
      } else {
        this.targetEl_.style.height = '0';
        this.targetEl_.removeAttribute(EXPANDED_ATTR);
      }

      this.innerHTML = `<button class="${this.className}__button"></button>`;
      this.buttonEl_ = this.querySelector('button');

      this.toggleHidden_();
      this.updateLabel_();

      [LABEL_ATTR, TARGET_ATTR, WATCH_ATTR].forEach((attr) => {
        this.removeAttribute(attr);
      });

      this.hasSetup_ = true;
    }
  }

  /**
   * Hides itself if observed element is hidden since there's no target
   * for the expandable to expand/collapse.
   */
  private toggleHidden_(): void {
    if (this.watchEl_.hasAttribute(HIDDEN_ATTR)) {
      this.setAttribute(HIDDEN_ATTR, '');
    } else {
      this.removeAttribute(HIDDEN_ATTR);
    }
  }

  /**
   * Toggles attribute which triggers the attributeChanged callback.
   */
  private toggleExpanded_(e: Event): void {
    const target = <Element>e.target;
    if (target.tagName.toLowerCase() === 'button') {
      if (this.hasAttribute(EXPANDED_ATTR)) {
        this.removeAttribute(EXPANDED_ATTR);
      } else {
        this.setAttribute(EXPANDED_ATTR, '');
      }
    }
  }

  /**
   * Expands or collapses the target element.
   */
  private expandCollapse_(action: string): void {
    if (!this.hasSetup_) {
      return;
    }

    const elHeight = this.targetEl_.scrollHeight;

    if (action === 'expand') {
      this.targetEl_.setAttribute(EXPANDED_ATTR, '');
      this.targetEl_.style.height = `${elHeight / 16}rem`;
      this.targetEl_.addEventListener('transitionend', () => {
        this.targetEl_.style.height = null;
      }, {once: true});

    } else {
      this.targetEl_.removeAttribute(EXPANDED_ATTR);
      window.requestAnimationFrame(() => {
        this.targetEl_.style.height = `${elHeight / 16}rem`;
        window.requestAnimationFrame(() => {
          this.targetEl_.style.height = '0';
        });
      });
    }

    this.updateLabel_();
  }

  /**
   * Updates label text based on whether the element is expanded or collapsed.
   */
  private updateLabel_(): void {
    const expanded = this.hasAttribute(EXPANDED_ATTR);
    const prefix = expanded ? 'Hide' : 'Show';
    this.buttonEl_.textContent = `${prefix} ${this.label_}`;
    localStorage.setItem(EXPANDED_ATTR, String(expanded));
  }
}

export {Expandable};
