const WEEKDAYS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Zig-zag calories modifiers per day of the week. */
const ZIGZAG_CALORIES: number[] = [1, .9, 1.1, 1, 1, .8, 1.2];

const ZIGZAG_ID: string = 'zig-zag-data';

class ZigZag extends HTMLElement {
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
   * Renders the custom element's DOM and creates reference to its elements
   * that will udpate on user interaction.
   */
  private setupDom_() {
    let html = `<div id="${ZIGZAG_ID}" class="${ZIGZAG_ID}">`;
    for (let i = 0; i < ZIGZAG_CALORIES.length; i++) {
      html += `\
        <div class="zig-zag__day">\
          <div class="zig-zag__label">${WEEKDAYS[i]}</div>\
          <result-counter class="zig-zag__value"></result-counter>\
        </div>\
      `;
    }
    html += '</div>';
    this.innerHTML += html.replace(/\s\s/g, '');

    this.counters_ = this.querySelectorAll('result-counter');
  }

  /**
   * Updates all counters with each day's zig-zag value.
   */
  private update_(newValue: string) {
    for (let i = 0; i < ZIGZAG_CALORIES.length; i++) {
      const dailyValue = (ZIGZAG_CALORIES[i] * parseInt(newValue, 10)).toFixed();
      const el = <HTMLElement>this.counters_[i];
      el.setAttribute('value', dailyValue);
      el.setAttribute('increment', '');
    }
  }
}

export {ZigZag};
