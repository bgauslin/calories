/**
 * Custom element for the Calorie Calculator which renders all other custom
 * elements into its DOM.
 */
class App extends HTMLElement {
  private target: HTMLElement;

  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('touchstart', this.handleTouchstart);
    this.addEventListener('touchend', this.handleTouchend);
    this.setup();
  }

  disconnectedCallback() {
    this.removeEventListener('touchstart', this.handleTouchstart);
    this.removeEventListener('touchend', this.handleTouchend);
  }

  private async setup() {
    this.innerHTML = `
      <h1>Calories</h1>
      <app-info></app-info>
      <user-values></user-values>
      <number-ticker id="results" label="Average Daily Calories" value="0" hidden></number-ticker>
      <zig-zag hidden></zig-zag>
    `;
  }

  private handleTouchstart(event: TouchEvent) {
    const composed = event.composedPath();
    this.target = <HTMLElement>composed[0];

    if (this.target.tagName === 'BUTTON') {
      this.target.classList.add('touch');
    }
  }

  private handleTouchend() {
    this.target.classList.remove('touch');
  }
}

customElements.define('calories-app', App);
