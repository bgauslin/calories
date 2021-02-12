/**
 * Custom element that provides a group of radio buttons with an animated 
 * visual marker that slides from the previously checked button to the
 * currently checked button.
 */
class RadioButtons extends HTMLElement {
  private resizeListener: any;

  constructor() {
    super();
    this.addEventListener('change', this.update);
    this.resizeListener = this.update.bind(this);
    window.addEventListener('resize', this.resizeListener);
  }

  static get observedAttributes(): string[] {
    return ['pending'];
  }

  attributeChangedCallback() {
    this.update();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.update);
    window.removeEventListener('resize', this.resizeListener);
  }

  /**
   * Sets custom properties to make the marker move to the selected target
   * via CSS transitions.
   */
  private update() {
    // Remove 'pending' attribute since it's only needed on initial page load.
    this.removeAttribute('pending');

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
    this.style.setProperty('--height', `${height / 16}rem`);
    this.style.setProperty('--left', `${leftPos / 16}rem`);
    this.style.setProperty('--width', `${targetEl.clientWidth / 16}rem`);
  }
}

customElements.define('radio-buttons', RadioButtons);
