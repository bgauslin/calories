const EXPANDED_ATTR: string = 'expanded';

class Expandable extends HTMLElement {
  buttonEl_: HTMLElement;
  hasSetup_: boolean;
  label_: string;
  target_: string;
  targetEl_: HTMLElement;

  constructor() {
    super();
    this.hasSetup_ = false;
    this.label_ = this.getAttribute('label');
    this.target_ = this.getAttribute('target');
    this.addEventListener('click', this.toggleExpanded_);
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
  }

  /**
   * Adds a button element to the DOM, and sets initial state of the expandable
   * and related elements.
   */
  private setup_(): void {
    this.targetEl_ = document.getElementById(this.target_);

    if (this.targetEl_) {
      if (localStorage.getItem(EXPANDED_ATTR) === 'true') {
        this.setAttribute(EXPANDED_ATTR, '');
        this.targetEl_.setAttribute(EXPANDED_ATTR, '');
      } else {
        this.targetEl_.style.height = '0';
        this.targetEl_.removeAttribute(EXPANDED_ATTR);
      }

      this.innerHTML = `<button class="${this.className}__button"></button>`;
      this.buttonEl_ = this.querySelector('button');

      this.updateLabel_();
      this.hasSetup_ = true;
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
