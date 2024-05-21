/**
 * Custom element for the Calorie Calculator which renders all other custom
 * elements into its DOM.
 */
class App extends HTMLElement {
  private results: HTMLElement;
  private target: HTMLElement;
  private valuesListener: EventListenerObject;
  private zigzag: HTMLElement;

  constructor() {
    super();
    this.valuesListener = this.update.bind(this);
  }

  connectedCallback() {
    this.addEventListener('touchstart', this.handleTouchstart, {passive: true});
    this.addEventListener('touchend', this.handleTouchend, {passive: true});
    this.addEventListener('valuesUpdated', this.valuesListener);
    this.setup();
  }

  disconnectedCallback() {
    this.removeEventListener('touchstart', this.handleTouchstart);
    this.removeEventListener('touchend', this.handleTouchend);
    this.removeEventListener('valuesUpdated', this.valuesListener);
  }

  private setup() {
    const label = 'Average Daily Calories';

    this.innerHTML = `
      <h1>Calories</h1>
      <app-info></app-info>
      <user-values></user-values>
      <number-ticker label="${label}"></number-ticker>
      <zig-zag></zig-zag>
    `;

    this.results = <HTMLElement>this.querySelector('number-ticker');
    this.zigzag = <HTMLElement>this.querySelector('zig-zag');

    this.results.hidden = true;
    this.zigzag.hidden = true;
  }

  private update(event: CustomEvent) {
    const {bmr, tdee, tdeeMax} = event.detail;

    this.results.setAttribute('bmr', bmr.toFixed());
    this.results.setAttribute('value', tdee.toFixed());
    this.zigzag.setAttribute('tdee', tdee.toFixed());
    this.zigzag.setAttribute('max-tdee', tdeeMax.toFixed());

    this.results.hidden = false;
    this.zigzag.hidden = false;
  }

  private handleTouchstart(event: TouchEvent) {
    this.target = <HTMLElement>event.composedPath()[0];

    if (this.target.tagName === 'BUTTON') {
      this.target.classList.add('touch');
    }
  }

  private handleTouchend() {
    this.target.classList.remove('touch');
  }
}

customElements.define('calories-app', App);
