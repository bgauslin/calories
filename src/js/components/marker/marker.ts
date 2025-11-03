/**
 * Custom element that provides a group of radio buttons with an animated 
 * visual marker that slides from the previously checked button to the
 * currently checked button.
 */
customElements.define('calories-marker', class extends HTMLElement {
  private resizeHandler: EventListenerObject;

  constructor() {
    super();
    this.resizeHandler = this.update.bind(this);
  }

  connectedCallback() {
    this.addEventListener('change', this.update, true);
    this.addEventListener('keyup', this.handleKey);
    window.addEventListener('resize', this.resizeHandler);
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.update);
    this.removeEventListener('keyup', this.handleKey);
    window.removeEventListener('resize', this.resizeHandler);
  }

  /**
   * Sets custom properties to make the marker move to the selected target
   * via CSS transitions.
   */
  private update() {
    const checked = this.querySelector(':checked');
    
    if (!checked) return;

    const target = <HTMLElement>checked.parentNode;

    // The marker and this element rely on relative/absolute positioning, so
    // subtract this element's position in the viewport from the marker
    // target's position in order to make the starting edge of this element
    // equal to zero.
    const leftPos = target.getBoundingClientRect().left - this.getBoundingClientRect().left;
    const height = target.clientHeight;

    // Update custom properties and let the CSS take over.
    this.style.setProperty('--height', `${height}px`);
    this.style.setProperty('--left', `${leftPos}px`);
    this.style.setProperty('--width', `${target.clientWidth}px`);
  }

/**
 * Adds [enter] key functionality to radio buttons.
 */
  private handleKey(event: KeyboardEvent) {
    const target = <HTMLElement>event.target;
    const radio = target.querySelector('input[type=radio]');
    if (radio && event.code === 'Enter') {
      target.click();
    }
  }
});
