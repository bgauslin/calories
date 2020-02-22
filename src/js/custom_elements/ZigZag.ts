/** Daily zig-zag calorie needs modifiers per day of the week. */
const ZIGZAG_CALORIES: number[] = [1, .9, 1.1, 1, 1, .8, 1.2];

const WEEKDAYS = [
  ['Sun', 'Sunday'],
  ['Mon', 'Monday'],
  ['Tue', 'Tuesday'],
  ['Wed', 'Wednesday'],
  ['Thu', 'Thursday'],
  ['Fri', 'Friday'],
  ['Sat', 'Saturday'],
];

const ZIGZAG_ID: string = 'zig-zag-data';

class ZigZag extends HTMLElement {
  private chart_: HTMLElement;
  private counters_: NodeList;

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
   * Renders the DOM for the custom element.
   */
  private setupDom_() {
    let html = `<div id="${ZIGZAG_ID}" class="${ZIGZAG_ID}">`;
    for (let i = 0; i < ZIGZAG_CALORIES.length; i++) {
      html += `\
        <div class="zig-zag__day">\
          <div class="zig-zag__label">${WEEKDAYS[i][1]}</div>\
          <result-counter class="zig-zag__value"></result-counter>\
        </div>\
      `;
    }
    html += '</div>';

    this.innerHTML += html.replace(/\s\s/g, '');

    this.chart_ = this.querySelector(`#${ZIGZAG_ID}`);
    this.counters_ = this.querySelectorAll('result-counter');
  }

  /**
   * Updates all results counters with each day's zig-zag value.
   */
  private update_(newValue: string) {
    ZIGZAG_CALORIES.forEach((day, i) => {
      const dailyValue = (ZIGZAG_CALORIES[i] * parseInt(newValue, 10)).toFixed();
      const el = <HTMLElement>this.counters_[i]
      el.setAttribute('value', dailyValue);
      el.setAttribute('increment', '');
    });
  }
}

export {ZigZag};
