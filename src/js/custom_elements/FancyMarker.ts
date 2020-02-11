import {Attribute} from '../modules/Constants';

enum CustomProperty {
  HEIGHT = '--marker-height',
  LEFT = '--marker-left',
  WIDTH = '--marker-width',
}

class FancyMarker extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', () => this.update_());
    window.addEventListener('resize', () => this.update_());
  }

  static get observedAttributes(): string[] {
    return [Attribute.INIT];
  }

  connectedCallback(): void {
    this.renderMarker_();
  }

  attributeChangedCallback(): void {
    this.update_();
  }

  disconnectedCallback(): void {
    this.removeEventListener('change', null);
    window.removeEventListener('resize', null);
  }

  private renderMarker_(): void {
    const marker = document.createElement('div');
    marker.classList.add('marker');
    this.appendChild(marker);
  }

  private update_(): void {
    // Remove 'init' attribute since it's only needed on initial page load.
    this.removeAttribute(Attribute.INIT);

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
    const height = targetEl.clientHeight;

    // Update custom properties and let the CSS take over.
    this.style.setProperty(CustomProperty.HEIGHT, `${height / 16}rem`);
    this.style.setProperty(CustomProperty.LEFT, `${leftPos / 16}rem`);
    this.style.setProperty(CustomProperty.WIDTH, `${targetEl.clientWidth / 16}rem`);
  }
}

export {FancyMarker};
