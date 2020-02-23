const BASE_CLASS: string = 'zig-zag';
const DAILY_MODIFIERS: number[] = [1, .9, 1.1, 1, .8, 1, 1.2];
const ID: string = 'zig-zag';
const MINIMUM_TDC: number = 1200;
const TDC_ATTR: string = 'tdc';
const TDC_MAX_ATTR: string = 'max-tdc';
const WEEKDAYS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

class ZigZag extends HTMLElement {
  private counters_: NodeList;
  private days_: NodeList;

  constructor() {
    super();
    this.setupDom_();
  }

  static get observedAttributes(): string[] {
    return [TDC_ATTR, TDC_MAX_ATTR];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    const tdc = this.getAttribute(TDC_ATTR);
    const tdcMax = this.getAttribute(TDC_MAX_ATTR);
    this.update_(tdc, tdcMax);
  }

  /**
   * Renders the custom element's DOM and creates reference to its elements
   * that will udpate on user interaction.
   */
  private setupDom_() {
    let html = `<div id="${ID}" class="${BASE_CLASS}">`;
    for (let i = 0; i < DAILY_MODIFIERS.length; i++) {
      html += `\
        <div class="${BASE_CLASS}__day">\
          <div class="${BASE_CLASS}__label">${WEEKDAYS[i]}</div>\
          <result-counter class="${BASE_CLASS}__value"></result-counter>\
        </div>\
      `;
    }
    html += '</div>';
    html += `<app-expandable class="expandable" target="${ID}" label="zig-zag calories"></app-expandable>`;

    this.innerHTML = html.replace(/\s\s/g, '');

    this.counters_ = this.querySelectorAll('result-counter');
    this.days_ = this.querySelectorAll(`.${BASE_CLASS}__day`);
  }

  /**
   * Updates all counters with each day's zig-zag value.
   */
  private update_(tdc: string, tdcMax: string) {
    // Create array of all adjusted TDC values, and get highest value for
    // setting the bar chart's upper bound.
    const allValues = DAILY_MODIFIERS.map(day => parseInt(tdc, 10) * day);
    const maxModifier = Math.max(...DAILY_MODIFIERS);
    const maxValue = Number(tdcMax) * maxModifier;

    // Convert adjusted TDC values to a percentage relative to the highest
    // possible value for drawing a bar chart via CSS.
    const barLengths = allValues.map(value => Math.round((value / maxValue) * 100));

    // Set attribute values on counter elements which will trigger their
    // attributeChangedCallback and make them update themselves.
    allValues.forEach((value, i) => {
      const counter = <HTMLElement>this.counters_[i];
      counter.setAttribute('value', value.toFixed());
      counter.setAttribute('increment', '');
    });

    // Set custom property for each day as a width percentage so that the CSS
    // displays each as a bar graph value.
    barLengths.forEach((length, i) => {
      const day = <HTMLElement>this.days_[i];
      day.style.setProperty('--width', `${length}%`);
    });

    // Set warning class for extremely low values.
    allValues.forEach((value, i) => {
      const day = <HTMLElement>this.days_[i];
      if (value < MINIMUM_TDC) {
        day.classList.add('warning');
      } else {
        day.classList.remove('warning');
      }
    });
  }
}

export {ZigZag};
