const ARIA_EXPANDED_ATTR: string = 'aria-expanded';
const ARIA_HIDDEN_ATTR: string = 'aria-hidden';
const FOR_ATTR: string = 'for';
const HIDDEN_ATTR: string = 'hidden';
const LABEL_ATTR: string = 'label';
const STORAGE_ITEM: string = 'expanded';
const WATCH_ATTR: string = 'watch';

/**
 * Custom element that expands/collapses its target element.
 */
class Expandable extends HTMLElement {
  private hasSetup: boolean;
  private label: string;
  private observer: MutationObserver;
  private target: HTMLElement;
  private watched: HTMLElement;

  constructor() {
    super();
    this.hasSetup = false;
    this.addEventListener('click', this.toggleExpanded);
    this.addEventListener('keyup', this.handleKey);
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
    this.removeEventListener('keyup', this.handleKey);
    this.observer.disconnect();
  }

  /**
   * Adds a button element to the DOM, and sets initial state of the expandable
   * and related elements.
   */
  private setup() {
    this.label = this.getAttribute(LABEL_ATTR);
    this.target = document.getElementById(this.getAttribute(FOR_ATTR));
    this.watched = document.getElementById(this.getAttribute(WATCH_ATTR));

    if (this.label && this.target && this.watched) {
      this.observer.observe(this.watched, {attributes: true});

      if (localStorage.getItem(STORAGE_ITEM) === 'true') {
        this.setAttribute(ARIA_EXPANDED_ATTR, 'true');
        this.target.removeAttribute(ARIA_HIDDEN_ATTR);
      } else {
        this.target.style.height = '0';
        this.target.setAttribute(ARIA_HIDDEN_ATTR, 'true');
      }

      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', '0');
      this.setAttribute('aria-controls', this.target.id);

      this.toggleHidden();
      this.updateLabel();

      for (const attribute of [FOR_ATTR, LABEL_ATTR, WATCH_ATTR]) {
        this.removeAttribute(attribute);
      }

      this.hasSetup = true;
    }
  }

  /**
   * Hides itself if observed element is hidden since there's no target
   * for the expandable to expand/collapse.
   */
  private toggleHidden() {
    if (this.watched.hasAttribute(HIDDEN_ATTR)) {
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
   * Adds keyboard navigation to the expandable.
   */
  private handleKey(event: KeyboardEvent) {
    if (event.code ==='Enter') {
      this.toggleExpanded();
    }
  }

  /**
   * Expands or collapses the target element.
   */
  private expandCollapse(action: string) {
    if (!this.hasSetup) {
      return;
    }

    const elementHeight = this.target.scrollHeight;

    if (action === 'expand') {
      this.target.removeAttribute(ARIA_HIDDEN_ATTR);
      this.target.style.height = `${elementHeight / 16}rem`;
      this.target.addEventListener('transitionend', () => {
        this.target.style.height = null;
      }, {once: true});

    } else {
      this.target.setAttribute(ARIA_HIDDEN_ATTR, 'true');
      window.requestAnimationFrame(() => {
        this.target.style.height = `${elementHeight / 16}rem`;
        window.requestAnimationFrame(() => {
          this.target.style.height = '0';
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

customElements.define('expand-able', Expandable);
