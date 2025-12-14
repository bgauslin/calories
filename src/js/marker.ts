import {Events} from './shared';


/**
 * Vanilla custom element that provides a group of radio buttons with an
 * animated  visual marker that slides from the previously checked radio button
 * to the currently checked radio button.
 */
customElements.define('calories-marker', class extends HTMLElement {
  private resizeHandler: EventListenerObject;

  constructor() {
    super();
    this.resizeHandler = this.update.bind(this);
  }

  connectedCallback() {
    this.addEventListener(Events.Change, this.update, true);
    window.addEventListener(Events.Resize, this.resizeHandler);
  }

  disconnectedCallback() {
    this.removeEventListener(Events.Change, this.update);
    window.removeEventListener(Events.Resize, this.resizeHandler);
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
    const {left} = this.getBoundingClientRect();
    const {left: targetLeft} = target.getBoundingClientRect();

    const style = window.getComputedStyle(this);
    const borderWidth = parseInt(style.getPropertyValue('border-width'));

    const blockSize = target.clientHeight;
    const inlineSize = target.clientWidth;
    const insetBlockStart = targetLeft - left - borderWidth;

    // Update custom properties and let the CSS take over.
    this.style.setProperty('--block-size', `${blockSize}px`);
    this.style.setProperty('--inset-block-start', `${insetBlockStart}px`);
    this.style.setProperty('--inline-size', `${inlineSize}px`);
  }
});
