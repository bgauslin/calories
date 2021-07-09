/**
 * Custom element that provides a group of radio buttons with an animated 
 * visual marker that slides from the previously checked button to the
 * currently checked button.
 */
class RadioButtons extends HTMLElement {
  private resizeListener: EventListenerObject;

  constructor() {
    super();
    this.addEventListener('change', this.update, true);
    this.resizeListener = this.update.bind(this);
    window.addEventListener('resize', this.resizeListener);
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
    const checked = this.querySelector(':checked');
    if (checked) {
      const target = checked.parentNode as HTMLElement;

      // The marker and this element rely on relative/absolute positioning, so
      // subtract this element's position in the viewport from the marker
      // target's position in order to make the starting edge of this element
      // equal to zero.
      const leftPos = target.getBoundingClientRect().left - this.getBoundingClientRect().left;
      const height = target.clientHeight;

      // Update custom properties and let the CSS take over.
      this.style.setProperty('--height', `${height / 16}rem`);
      this.style.setProperty('--left', `${leftPos / 16}rem`);
      this.style.setProperty('--width', `${target.clientWidth / 16}rem`);
    }
  }
}

customElements.define('radio-buttons', RadioButtons);
