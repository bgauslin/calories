import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';


/**
 * Custom element that renders daily TDEE based on overall TDEE where each
 * day's TDEE value is adjusted for "zig-zag" calorie counting.
 */
@customElement('calories-zigzag') class ZigZag extends LitElement {
  private days = new Map([
    ['Sunday', 1], 
    ['Monday', .9],
    ['Tuesday', 1.1],
    ['Wednesday', 1],
    ['Thursday', .8],
    ['Friday', 1],
    ['Saturday', 1.2],
  ]);
  private modifiers = [...this.days.values()];
  private tdeeMin = 1200;

  @property({reflect: true, type: Number}) tdee = 0;
  @property({attribute: 'tdee-max', reflect: true, type: Number}) tdeeMax = 0;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  protected createRenderRoot() {
    return this;
  }

  protected render() {
    const dailyMax = this.tdeeMax * Math.max(...this.modifiers);
    
    const dailyTdee = [];
    for (const [label, modifier] of this.days.entries()) {
      const dailyModified = Math.round(this.tdee * modifier);
      const percent = Math.round((dailyModified / dailyMax) * 100);
      const className = (dailyModified < this.tdeeMin) ? 'warning' : undefined;
      dailyTdee.push(html`
        <li
          class="${ifDefined(className ? className : undefined)}"
          style="inline-size:${percent}%">
          <span aria-label="${label}">${label.substring(0, 3)}</span>
          <calories-ticker
            aria-label="${dailyModified}"
            value="${dailyModified}"></calories-ticker>
        </li>
      `);
    }

    return html`<ol>${dailyTdee}</ol>`;
  }
}
