const DAILY_MODIFIERS: number[] = [1, .9, 1.1, 1, .8, 1, 1.2];
const MINIMUM_TDEE: number = 1200;
const TDEE_ATTR: string = 'tdee';
const TDEE_MAX_ATTR: string = 'max-tdee';
const WARNING_CLASS: string = 'warning';

/**
 * Custom element that renders daily TDEE based on overall TDEE where each
 * day's TDEE value is adjusted for "zig-zag" calorie counting.
 */
class ZigZag extends HTMLElement {
  private days: NodeList;
  private hasSetup: boolean;
  private tickers: NodeList;

  constructor() {
    super();
    this.hasSetup = false;
  }

  static get observedAttributes(): string[] {
    return [TDEE_ATTR, TDEE_MAX_ATTR];
  }

  attributeChangedCallback() {
    if (this.hasSetup) {
      this.update();
    }
  }

  connectedCallback() {
    if (!this.hasSetup) {
      this.setup();
      this.update();
    }
  }

  /**
   * Renders the custom element's DOM and creates reference to its elements
   * that will udpate on user interaction. Because expandable is within this
   * element, it needs a sibling element to target for expanding/collapsing.
   */
  private setup() {
    const zigZagTemplate = require('./zigzag.pug');
    this.innerHTML = zigZagTemplate();

    this.days = this.querySelectorAll('zig-zag li');
    this.tickers = this.querySelectorAll('number-ticker');

    this.hasSetup = true;
  }

  /**
   * Updates all tickers with each day's zig-zag value.
   */
  private update() {
    const tdee = this.getAttribute(TDEE_ATTR);
    const tdeeMax = this.getAttribute(TDEE_MAX_ATTR);

    // Create array of all adjusted TDEE values, and get highest value for
    // setting the bar chart's upper bound.
    const allValues = DAILY_MODIFIERS.map(day => parseInt(tdee, 10) * day);
    const maxModifier = Math.max(...DAILY_MODIFIERS);
    const maxValue = Number(tdeeMax) * maxModifier;

    // Convert adjusted TDEE values to a percentage relative to the highest
    // possible value for drawing a bar chart via CSS.
    const barLengths = allValues.map(value => Math.round((value / maxValue) * 100));

    // Set attribute values on <number-ticker> elements which will trigger 
    // their attributeChangedCallback and update themselves.
    allValues.forEach((value, i) => {
      const ticker = this.tickers[i] as HTMLElement;
      ticker.setAttribute('value', value.toFixed());
    });

    // Set inline style for each day as a width percentage so that the CSS
    // displays each as a bar graph value.
    barLengths.forEach((length, i) => {
      const day = this.days[i] as HTMLElement;
      day.style.width = `${length}%`;
    });

    // Set warning class for extremely low values.
    allValues.forEach((value, i) => {
      const day = this.days[i] as HTMLElement;
      if (value < MINIMUM_TDEE) {
        day.classList.add(WARNING_CLASS);
      } else {
        day.classList.remove(WARNING_CLASS);
      }
    });
  }
}

customElements.define('zig-zag', ZigZag);
