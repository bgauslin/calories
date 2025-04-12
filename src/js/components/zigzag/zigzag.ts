import {LitElement, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

/**
 * Custom element that renders daily TDEE based on overall TDEE where each
 * day's TDEE value is adjusted for "zig-zag" calorie counting.
 */
@customElement('zig-zag')
class ZigZag extends LitElement {
  @property({attribute: 'tdee', type: Number}) tdee = 0;
  @property({attribute: 'tdee-max', type: Number}) tdeeMax = 0;
  @query('li') days: HTMLElement[];
  @query('number-ticker') tickers: HTMLElement[];
  @state() minimumTDEE: number = 1200;
  @state() modifiers: number[] = [1, .9, 1.1, 1, .8, 1, 1.2];
  @state() weekdays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  protected createRenderRoot() {
    return this;
  }

  protected render() {
    // Create array of all adjusted TDEE values, and get highest value for
    // setting the bar chart's upper bound.
    const tdeeAll = this.modifiers.map(day => Math.round(this.tdee * day));
    const modifierMax = Math.max(...this.modifiers);
    const valueMax = this.tdeeMax * modifierMax;

    // Convert adjusted TDEE values to a percentage relative to the highest
    // possible value for drawing a bar chart via CSS.
    const widths = tdeeAll.map(value => Math.round((value / valueMax) * 100));
    
    return html`
      <ol>
      ${this.weekdays.map((day, index) => {
        const width = widths[index];
        const value = tdeeAll[index];
        const className = (value < this.minimumTDEE) ? 'warning' : undefined;

        return html`
        <li
          class="${ifDefined(className ? className : undefined)}"
          style="width: ${width}%">
          <span aria-label="${day}">${day.substring(0, 3)}</span>
          <number-ticker
            aria-label="${value}"
            value="${value}"></number-ticker>
        </li>
        `})}
      </ol>
    `;
  }
}
