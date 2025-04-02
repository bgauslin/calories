import {LitElement, html} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';

/**
 * Custom element for the Calorie Calculator which renders all other custom
 * elements into its DOM.
 */
@customElement('calories-app')
class App extends LitElement {
  private touchTarget: HTMLElement;
  private valuesListener: EventListenerObject;

  @query('number-ticker') results: HTMLElement;
  @query('zig-zag') zigzag: HTMLElement;

  @state() bmr: number = 0;
  @state() ready: boolean = false;
  @state() tdee: number = 0;
  @state() tdeeMax: number = 0;

  constructor() {
    super();
    this.valuesListener = this.updateApp.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('touchstart', this.handleTouchstart, {passive: true});
    this.addEventListener('touchend', this.handleTouchend, {passive: true});
    this.addEventListener('valuesUpdated', this.valuesListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('touchstart', this.handleTouchstart);
    this.removeEventListener('touchend', this.handleTouchend);
    this.removeEventListener('valuesUpdated', this.valuesListener);
  }

  protected createRenderRoot() {
    return this;
  }

  private updateApp(event: CustomEvent) {
    const {bmr, tdee, tdeeMax} = event.detail;

    this.bmr = bmr;
    this.tdee = tdee;
    this.tdeeMax = tdeeMax;

    this.ready = true;
  }

  private handleTouchstart(event: TouchEvent) {
    this.touchTarget = <HTMLElement>event.composedPath()[0];

    if (this.touchTarget.tagName === 'BUTTON') {
      this.touchTarget.classList.add('touch');
    }
  }

  private handleTouchend() {
    this.touchTarget.classList.remove('touch');
  }

  protected render() {
    return html`
      <h1>Calories</h1>
      <app-info></app-info>
      <user-values></user-values>
      <number-ticker
        label="Average Daily Calories"
        value="${this.tdee.toFixed()}"
        ?hidden="${!this.ready}"></number-ticker>
      <zig-zag
        tdee="${this.tdee.toFixed()}"
        max-tdee="${this.tdeeMax.toFixed()}"
        ?hidden="${!this.ready}"></zig-zag>
    `;
  }
}

