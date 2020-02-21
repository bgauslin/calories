import {Attribute} from '../modules/Constants';

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

class ZigZag extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return [Attribute.TDC];
  }

  // connectedCallback(): void {
  // }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    this.renderTable_(newValue);
  }

  /**
   * Creates zig-zag calorie needs across 7 days where each day's needs differ
   * to prevent weight loss plateau.
   */
  private renderTable_(newValue: string): void {
    const table = this.querySelector('.table');
    if (table) {
      table.remove();
    }

    let html = `\
      <div id="zig-zag-table" class="table">
        <table>\
    `;

    ZIGZAG_CALORIES.forEach((day, i) => {
      const dailyValue = (ZIGZAG_CALORIES[i] * parseInt(newValue, 10)).toFixed();
      html += `\
        <tr>\
          <td>${WEEKDAYS[i][1]}</td>\
          <td>${dailyValue}</td>\
        </tr>\
      `;
    });
    html += `\
        </table>\
      </div>\
    `;

    this.innerHTML += html.replace(/\s\s/g, '');
  }
}

export {ZigZag};
