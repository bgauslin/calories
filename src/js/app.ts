import {LitElement, html} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {Formulas} from './formulas';
import {ActivityLevel, Events, WeightGoal} from './shared';


/**
 * Custom element for the Calorie Calculator which renders all other custom
 * elements into its DOM.
 */
@customElement('calories-app') class App extends LitElement {
  private formulas: Formulas;
  private touchTarget: HTMLElement;
  private valuesHandler: EventListenerObject;
  
  @query('calories-ticker') results: HTMLElement;
  @query('calories-zigzag') zigzag: HTMLElement;

  @state() bmr: number = 0;
  @state() ready: boolean = false;
  @state() tdee: number = 0;
  @state() tdeeMax: number = 0;

  constructor() {
    super();
    this.formulas = new Formulas();
    this.valuesHandler = this.updateApp.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(Events.TouchStart, this.handleTouchStart, {passive: true});
    this.addEventListener(Events.TouchEnd, this.handleTouchEnd, {passive: true});
    this.addEventListener(Events.Values, this.valuesHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(Events.TouchStart, this.handleTouchStart);
    this.removeEventListener(Events.TouchEnd, this.handleTouchEnd);
    this.removeEventListener(Events.Values, this.valuesHandler);
  }

  protected createRenderRoot() {
    return this;
  }

  private updateApp(event: CustomEvent) {
    const {detail} = event;
    const {activity, age, goal, height, sex, weight} = detail.measurements;
    
    // Get BMR and factors based on selected values, then TDEE and maximum TDEE
    // for zig-zag chart.
    this.bmr = this.formulas.basalMetabolicRate({age, height, sex, weight});

    const activityLevel = ActivityLevel.find(level => activity === level.value);
    const goalLevel = WeightGoal.find(level => goal === level.value);

    this.tdee = this.formulas.totalDailyEnergyExpenditure({
      activity: activityLevel.factor,
      bmr: this.bmr,
      goal: goalLevel.factor,
    });

    this.tdeeMax = this.formulas.totalDailyEnergyExpenditure({
      activity: ActivityLevel[ActivityLevel.length - 1].factor,
      bmr: this.bmr,
      goal: WeightGoal[0].factor,
    });
    
    this.ready = true;
  }

  private handleTouchStart(event: TouchEvent) {
    this.touchTarget = <HTMLElement>event.composedPath()[0];

    if (this.touchTarget.tagName === 'BUTTON') {
      this.touchTarget.classList.add('touch');
    }
  }

  private handleTouchEnd() {
    this.touchTarget.classList.remove('touch');
  }

  protected render() {
    const tdee_ = this.tdee.toFixed();
    const tdeeMax_ = this.tdeeMax.toFixed();
    const caption = 'Average Daily Calories';

    return html`
      <h1>${document.title}</h1>
      <calories-info></calories-info>
      <calories-values></calories-values>
      <calories-ticker
        aria-label="${tdee_} ${caption}"
        label="${caption}"
        value="${tdee_}"
        ?hidden=${!this.ready}></calories-ticker>
      <calories-zigzag
        tdee="${tdee_}"
        tdee-max="${tdeeMax_}"
        ?hidden=${!this.ready}></calories-zigzag>
    `;
  }
}

