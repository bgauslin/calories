const INIT_ATTR: string = 'init';

enum CustomProperty {
  HEIGHT = '--marker-height',
  LEFT = '--marker-left',
  WIDTH = '--marker-width',
}

/**
 * Custom element that provides an active element with a visual marker that
 * animates from its previously active element to the current active element.
 */
class FancyMarker extends HTMLElement {
  private resizeListener_: any;

  constructor() {
    super();
    this.addEventListener('change', this.update_);
    this.resizeListener_ = this.update_.bind(this);
    window.addEventListener('resize', this.resizeListener_);
  }

  static get observedAttributes(): string[] {
    return [INIT_ATTR];
  }

  connectedCallback(): void {
    this.renderMarker_();
  }

  attributeChangedCallback(): void {
    this.update_();
  }

  disconnectedCallback(): void {
    this.removeEventListener('change', this.update_);
    window.removeEventListener('resize', this.resizeListener_);
  }

  /**
   * Creates and injects a marker element into the DOM.
   */
  private renderMarker_(): void {
    const marker = document.createElement('div');
    marker.classList.add('marker');
    this.appendChild(marker);
  }

  /**
   * Sets custom properties to make the marker move to the selected target
   * via CSS transitions.
   */
  private update_(): void {
    // Remove 'init' attribute since it's only needed on initial page load.
    this.removeAttribute(INIT_ATTR);

    // Get the checked element, then its parent since the checkbox itself has
    // no dimensions, relies on its sibling to trigger it, and their parent is
    // the target where CSS layout is applied and what we need for determining
    // the marker's position.
    const checked = this.querySelector(':checked');
    const targetEl = checked.parentNode as HTMLElement;

    // The marker and this element rely on relative/absolute positioning, so
    // subtract this element's position in the viewport from the marker
    // target's position in order to make the starting edge of this element
    // equal to zero.
    const leftPos = targetEl.getBoundingClientRect().left - this.getBoundingClientRect().left;
    const height = targetEl.clientHeight;

    // Update custom properties and let the CSS take over.
    this.style.setProperty(CustomProperty.HEIGHT, `${height / 16}rem`);
    this.style.setProperty(CustomProperty.LEFT, `${leftPos / 16}rem`);
    this.style.setProperty(CustomProperty.WIDTH, `${targetEl.clientWidth / 16}rem`);
  }
}

export {FancyMarker};
