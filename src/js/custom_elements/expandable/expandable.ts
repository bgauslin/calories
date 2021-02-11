const ARIA_EXPANDED_ATTR: string = 'aria-expanded';
const ARIA_HIDDEN_ATTR: string = 'aria-hidden';
const BUTTON_ID: string = 'expandable-button';
const HIDDEN_ATTR: string = 'hidden';
const LABEL_ATTR: string = 'label';
const STORAGE_ITEM: string = 'expanded';
const TARGET_ATTR: string = 'target';
const WATCH_ATTR: string = 'watch';

/**
 * Custom element that expands/collapses its target element.
 */
class Expandable extends HTMLElement {
  private hasSetup: boolean;
  private label: string;
  private observer: MutationObserver;
  private targetEl: HTMLElement;
  private watchEl: HTMLElement;

  constructor() {
    super();
    this.hasSetup = false;
    this.addEventListener('click', this.toggleExpanded);
    this.observer = new MutationObserver(() => this.toggleHidden());
  }

  static get observedAttributes(): string[] {
    return [ARIA_EXPANDED_ATTR];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    const direction = (newValue === 'true') ? 'expand' : 'collapse';
    this.expandCollapse(direction);
  }

  connectedCallback() {
    this.setup();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.toggleExpanded);
    this.observer.disconnect();
  }

  /**
   * Adds a button element to the DOM, and sets initial state of the expandable
   * and related elements.
   */
  private setup() {
    this.label = this.getAttribute(LABEL_ATTR);
    this.targetEl = document.getElementById(this.getAttribute(TARGET_ATTR));
    this.watchEl = document.getElementById(this.getAttribute(WATCH_ATTR));

    if (this.label && this.targetEl && this.watchEl) {
      this.observer.observe(this.watchEl, {attributes: true});

      if (localStorage.getItem(STORAGE_ITEM) === 'true') {
        [this, this.targetEl].forEach((element) => {
          element.setAttribute(ARIA_EXPANDED_ATTR, 'true');
        });
      } else {
        this.targetEl.style.height = '0';
        this.targetEl.setAttribute(ARIA_EXPANDED_ATTR, 'false');
        this.targetEl.setAttribute(ARIA_HIDDEN_ATTR, 'true');
      }

      this.id = BUTTON_ID;
      this.setAttribute('role', 'button');
      this.setAttribute('aria-controls', this.targetEl.id);
      this.targetEl.setAttribute('aria-controlledby', BUTTON_ID);

      this.toggleHidden();
      this.updateLabel();

      [LABEL_ATTR, TARGET_ATTR, WATCH_ATTR].forEach((attr) => {
        this.removeAttribute(attr);
      });

      this.hasSetup = true;
    }
  }

  /**
   * Hides itself if observed element is hidden since there's no target
   * for the expandable to expand/collapse.
   */
  private toggleHidden() {
    if (this.watchEl.hasAttribute(HIDDEN_ATTR)) {
      this.setAttribute(HIDDEN_ATTR, '');
    } else {
      this.removeAttribute(HIDDEN_ATTR);
    }
  }

  /**
   * Toggles attribute which triggers the attributeChanged callback.
   */
  private toggleExpanded() {
    const expanded = this.getAttribute(ARIA_EXPANDED_ATTR) === 'true';
    this.setAttribute(ARIA_EXPANDED_ATTR, String(!expanded));
  }

  /**
   * Expands or collapses the target element.
   */
  private expandCollapse(action: string) {
    if (!this.hasSetup) {
      return;
    }

    const elHeight = this.targetEl.scrollHeight;

    if (action === 'expand') {
      this.targetEl.removeAttribute(ARIA_HIDDEN_ATTR);
      this.targetEl.setAttribute(ARIA_EXPANDED_ATTR, 'true');
      this.targetEl.style.height = `${elHeight / 16}rem`;
      this.targetEl.addEventListener('transitionend', () => {
        this.targetEl.style.height = null;
      }, {once: true});

    } else {
      this.targetEl.setAttribute(ARIA_EXPANDED_ATTR, 'false');
      this.targetEl.setAttribute(ARIA_HIDDEN_ATTR, 'true');
      window.requestAnimationFrame(() => {
        this.targetEl.style.height = `${elHeight / 16}rem`;
        window.requestAnimationFrame(() => {
          this.targetEl.style.height = '0';
        });
      });
    }

    this.updateLabel();
  }

  /**
   * Updates label text based on whether the element is expanded or collapsed.
   */
  private updateLabel() {
    const expanded = this.getAttribute(ARIA_EXPANDED_ATTR) === 'true';
    const prefix = expanded ? 'Hide' : 'Show';
    this.textContent = `${prefix} ${this.label}`;
    localStorage.setItem(STORAGE_ITEM, String(expanded));
  }
}

customElements.define('app-expandable', Expandable);