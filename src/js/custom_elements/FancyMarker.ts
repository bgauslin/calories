const INIT_ATTR: string = 'init';

enum CustomProperty {
  LEFT = 'left',
  WIDTH = 'width',
}

class FancyMarker extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', () => this.update_());
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
    this.removeEventListener('change', null);
  }

  private renderMarker_(): void {
    const marker = document.createElement('div');
    marker.classList.add('marker');
    this.appendChild(marker);
  }

  private update_(): void {
    // Remove 'init' attribute since it's only needed on initial page load.
    this.removeAttribute(INIT_ATTR);

    // Get the checked element, then its parent since the checkbox itself has
    // no dimensions, relies on its sibling to trigger it, and their parent is
    // the target where CSS layout is applied and what we need for determining
    // the marker's position.
    const checked = this.querySelector(':checked');
    const targetEl = <HTMLElement>checked.parentNode;

    // The marker and this element rely on relative/absolute positioning, so
    // subtract this element's position in the viewport from the marker
    // target's position in order to make the starting edge of this element
    // equal to zero.
    const leftPos = targetEl.getBoundingClientRect().left - this.getBoundingClientRect().left;

    // Update custom properties and let the CSS handle take over.
    this.style.setProperty(
      `--marker-${CustomProperty.LEFT}`, `${leftPos / 16}rem`);
    this.style.setProperty(
      `--marker-${CustomProperty.WIDTH}`, `${targetEl.clientWidth / 16}rem`);
  }
}

export {FancyMarker};
