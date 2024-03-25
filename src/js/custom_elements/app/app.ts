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
    this.addEventListener('touchstart', this.handleTouchstart);
    this.addEventListener('touchend', this.handleTouchend);
    this.addEventListener('valuesUpdated', this.valuesListener);
    this.setup();
  }

  disconnectedCallback() {
    this.removeEventListener('touchstart', this.handleTouchstart);
    this.removeEventListener('touchend', this.handleTouchend);
    this.removeEventListener('valuesUpdated', this.valuesListener);
  }

  private setup() {
    this.innerHTML = `
      <h1>Calories</h1>
      <app-info></app-info>
      <user-values></user-values>
      <number-ticker label="Average Daily Calories"></number-ticker>
      <zig-zag></zig-zag>
    `;

    this.results = <HTMLElement>this.querySelector('number-ticker');
    this.zigzag = <HTMLElement>this.querySelector('zig-zag');

    this.results.setAttribute('hidden', '');
    this.zigzag.setAttribute('hidden', '');
  }

  private update (event: CustomEvent) {
    const detail = event.detail;
    const {bmr, tdee, tdeeMax} = detail;
    const _bmr = bmr.toFixed();
    const _tdee = tdee.toFixed();
    const _tdeeMax = tdeeMax.toFixed();

    this.results.setAttribute('value', _tdee);
    this.results.setAttribute('bmr', _bmr);
    this.results.removeAttribute('hidden');
 
    this.zigzag.setAttribute('tdee', _tdee);
    this.zigzag.setAttribute('max-tdee', _tdeeMax);
    this.zigzag.removeAttribute('hidden');
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
