const DAILY_MODIFIERS: number[] = [1, .9, 1.1, 1, .8, 1, 1.2];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MINIMUM_TDEE: number = 1200;

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
    return ['tdee', 'max-tdee'];
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
    let html = '<ol>';
    for (const day of DAYS) {
      html += `
        <li>
          <span aria-label="${day}">${day.substring(0, 3)}</span>
          <number-ticker value="0"></number-ticker>
        </li>
      `;
    }
    html += '</ol>';
    this.innerHTML = html;

    this.days = this.querySelectorAll('zig-zag li');
    this.tickers = this.querySelectorAll('number-ticker');
    
    this.hasSetup = true;
  }

  /**
   * Updates all tickers with each day's zig-zag value.
   */
  private update() {
    const tdee = this.getAttribute('tdee');
    const tdeeMax = this.getAttribute('max-tdee');

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
    for (const [index, value] of allValues.entries()) {
      const ticker = <HTMLElement>this.tickers[index];
      if (ticker) {
        ticker.setAttribute('value', value.toFixed());
      }
    }

    // Set inline style for each day as a width percentage so that the CSS
    // displays each as a bar graph value.
    for (const [index, length] of barLengths.entries()) {
      const day = <HTMLElement>this.days[index];
      if (day) {
        day.style.width = `${length}%`;
      }
    }

    // Set warning class for extremely low values.
    for (const [index, value] of allValues.entries()) {
      const day = <HTMLElement>this.days[index];
      if (day) {
        if (value < MINIMUM_TDEE) {
          day.classList.add('warning');
        } else {
          day.classList.remove('warning');
        }
      }
    }
  }
}

customElements.define('zig-zag', ZigZag);
