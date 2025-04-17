import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

/**
 * Custom element that renders daily TDEE based on overall TDEE where each
 * day's TDEE value is adjusted for "zig-zag" calorie counting.
 */
@customElement('calories-zigzag')
class ZigZag extends LitElement {
  private modifiers: number[] = [1, .9, 1.1, 1, .8, 1, 1.2];
  private tdeeMin: number = 1200;
  private weekdays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  @property({attribute: 'tdee', type: Number}) tdee = 0;
  @property({attribute: 'tdee-max', type: Number}) tdeeMax = 0;

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
        const className = (value < this.tdeeMin) ? 'warning' : undefined;

        return html`
        <li
          class="${ifDefined(className ? className : undefined)}"
          style="inline-size:${width}%">
          <span aria-label="${day}">${day.substring(0, 3)}</span>
          <calories-ticker
            aria-label="${value}"
            value="${value}"></calories-ticker>
        </li>
        `})}
      </ol>
    `;
  }
}
