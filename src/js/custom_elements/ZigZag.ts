/** For bar graph chart. */
const DIVIDER: number = 500;

const WEEKDAYS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Zig-zag calories modifiers per day of the week. */
const ZIGZAG_CALORIES: number[] = [1, .9, 1.1, 1, 1, .8, 1.2];

const ZIGZAG_ID: string = 'zig-zag';

class ZigZag extends HTMLElement {
  private counters_: NodeList;
  private labels_: NodeList;

  constructor() {
    super();
    this.setupDom_();
  }

  static get observedAttributes(): string[] {
    return ['tdc'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    this.update_(newValue);
  }

  /**
   * Renders the custom element's DOM and creates reference to its elements
   * that will udpate on user interaction.
   */
  private setupDom_() {
    let html = `<div id="${ZIGZAG_ID}" class="zig-zag">`;
    for (let i = 0; i < ZIGZAG_CALORIES.length; i++) {
      html += `\
        <div class="zig-zag__day">\
          <div class="zig-zag__label">${WEEKDAYS[i]}</div>\
          <result-counter class="zig-zag__value"></result-counter>\
        </div>\
      `;
    }
    html += '</div>';
    html += `<app-expandable class="expandable" target="${ZIGZAG_ID}" label="zig-zag calories"></app-expandable>`;

    this.innerHTML = html.replace(/\s\s/g, '');

    this.counters_ = this.querySelectorAll('result-counter');
    this.labels_ = this.querySelectorAll('.zig-zag__label');
  }

  /**
   * Updates all counters with each day's zig-zag value.
   */
  private update_(tdc: string) {
    // Create array of all adjusted TDC values, and get the highest for
    // setting the bar chart's upper bound.
    const allValues = ZIGZAG_CALORIES.map(day => parseInt(tdc, 10) * day);
    const max = Math.max(...allValues);
    const nSections = Math.ceil(max / DIVIDER);
    const upperBound = nSections * DIVIDER;
    
    // Convert adjusted TDC values to a percentage relative to the bounds
    // for drawing a bar chart via CSS.
    const barLengths = allValues.map(value => Math.round((value / upperBound) * 100));

    // Set attribute values on counter elements which will trigger their
    // attributeChangedCallback and make them update themselves.
    allValues.forEach((value, i) => {
      const counter = <HTMLElement>this.counters_[i];
      counter.setAttribute('value', value.toFixed());
      counter.setAttribute('increment', '');
    });

    // Set custom property for each label as a width percentage so that the CSS
    // displays each as a bar graph value.
    barLengths.forEach((length, i) => {
      const label = <HTMLElement>this.labels_[i];
      label.style.setProperty('--width', `${length}%`);
    });
  }
}

export {ZigZag};
