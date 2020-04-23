const DAILY_LABELS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAILY_MODIFIERS: number[] = [1, .9, 1.1, 1, .8, 1, 1.2];
const ID: string = 'zig-zag';
const MINIMUM_TDEE: number = 1200;
const TDEE_ATTR: string = 'tdee';
const TDEE_MAX_ATTR: string = 'max-tdee';
const WARNING_CLASS: string = 'warning';

/**
 * Custom element that renders daily TDEE based on overall TDEE where each
 * day's TDEE value is adjusted for "zig-zag" calorie counting.
 */
class ZigZag extends HTMLElement {
  private counters_: NodeList;
  private days_: NodeList;
  private hasSetup_: boolean;

  constructor() {
    super();
    this.hasSetup_ = false;
  }

  static get observedAttributes(): string[] {
    return [TDEE_ATTR, TDEE_MAX_ATTR];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (this.hasSetup_) {
      const tdee = this.getAttribute(TDEE_ATTR);
      const tdeeMax = this.getAttribute(TDEE_MAX_ATTR);
      this.update_(tdee, tdeeMax);
    }
  }

  connectedCallback(): void {
    if (!this.hasSetup_) {
      this.setup_();
    }
  }

  /**
   * Renders the custom element's DOM and creates reference to its elements
   * that will udpate on user interaction. Because expandable is within this
   * element, it needs a sibling element to target for expanding/collapsing.
   */
  private setup_() {
    let html = `<div class="${this.className}__data" id="${ID}">`;
    for (let i = 0; i < DAILY_MODIFIERS.length; i++) {
      html += `\
        <div class="${this.className}__day">\
          <div class="${this.className}__label">${DAILY_LABELS[i]}</div>\
          <results-counter class="${this.className}__value"></results-counter>\
        </div>\
      `;
    }
    html += '</div>';
    html += `\
      <app-expandable \
        class="expandable" \
        label="zig-zag calories" \
        target="${ID}" \
        watch="results"></app-expandable>`;

    this.innerHTML = html.replace(/\s\s/g, '');

    this.counters_ = this.querySelectorAll('results-counter');
    this.days_ = this.querySelectorAll(`.${this.className}__day`);

    this.hasSetup_ = true;
  }

  /**
   * Updates all counters with each day's zig-zag value.
   */
  private update_(tdee: string, tdeeMax: string) {
    // Create array of all adjusted TDEE values, and get highest value for
    // setting the bar chart's upper bound.
    const allValues = DAILY_MODIFIERS.map(day => parseInt(tdee, 10) * day);
    const maxModifier = Math.max(...DAILY_MODIFIERS);
    const maxValue = Number(tdeeMax) * maxModifier;

    // Convert adjusted TDEE values to a percentage relative to the highest
    // possible value for drawing a bar chart via CSS.
    const barLengths = allValues.map(value => Math.round((value / maxValue) * 100));

    // Set attribute values on counter elements which will trigger their
    // attributeChangedCallback and make them update themselves.
    allValues.forEach((value, i) => {
      const counter = <HTMLElement>this.counters_[i];
      counter.setAttribute('value', value.toFixed());
    });

    // Set custom property for each day as a width percentage so that the CSS
    // displays each as a bar graph value.
    barLengths.forEach((length, i) => {
      const day = <HTMLElement>this.days_[i];
      day.style.width = `${length}%`;
    });

    // Set warning class for extremely low values.
    allValues.forEach((value, i) => {
      const day = <HTMLElement>this.days_[i];
      if (value < MINIMUM_TDEE) {
        day.classList.add(WARNING_CLASS);
      } else {
        day.classList.remove(WARNING_CLASS);
      }
    });
  }
}

export {ZigZag};
