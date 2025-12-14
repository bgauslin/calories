import {LitElement, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {Formulas} from './formulas';
import {ActivityLevel, Measurements, WeightGoal, STORAGE_ITEM} from './shared';


/**
 * Lit custom element for calculating daily calorie needs based on user-provided
 * values.
 */
@customElement('calories-app') class App extends LitElement {
  private formulas: Formulas;

  @property() commas: boolean = false;
  @property() imperial: boolean = false;
  @property() measurements: Measurements;

  @query('calories-ticker') results: HTMLElement;
  @query('calories-zigzag') zigzag: HTMLElement;

  @state() bmr: number = 0;
  @state() ready: boolean = false;
  @state() tdee: number = 0;
  @state() tdeeMax: number = 0;

  constructor() {
    super();
    this.formulas = new Formulas();
  }

  connectedCallback() {
    super.connectedCallback();
    this.getLocalStorage();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  protected createRenderRoot() {
    return this;
  }

  private getLocalStorage() {
    const storage = localStorage.getItem(STORAGE_ITEM);
    if (!storage) return;

    const {commas, imperial, measurements} = JSON.parse(storage);
    this.commas = commas;
    this.imperial = imperial;
    this.measurements = measurements;

    this.updateResults();
  }

  /**
   * Save's user values for return visits.
   */
  private setLocalStorage() {
    localStorage.setItem(STORAGE_ITEM, JSON.stringify({
      commas: this.commas,
      imperial: this.imperial,
      measurements: this.measurements,
    }));
  }

  private updateApp(event: CustomEvent) {
    const {commas, imperial, measurements} = event.detail;
    this.commas = commas;
    this.imperial = imperial;
    this.measurements = measurements;

    this.updateResults();
    this.setLocalStorage();
  }

  /**
   * Calculates BMR, TDEE, and maximum TDEE and displays average daily calorie
   * needs and a zig-zag chart.
   */
  private updateResults() {
    this.ready = true;

    const {activity, age, goal, height, sex, weight} = this.measurements;
    const activityLevel = ActivityLevel.find(level => activity === level.value);
    const goalLevel = WeightGoal.find(level => goal === level.value);

    this.bmr = this.formulas.basalMetabolicRate({age, height, sex, weight});

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
  }

  protected render() {
    const tdee = this.tdee.toFixed();
    const tdeeMax = this.tdeeMax.toFixed();
    const caption = 'Average Daily Calories';

    return html`
      <h1>${document.title}</h1>
      <calories-info></calories-info>
      <calories-values
        .commas=${this.commas}
        .imperial=${this.imperial}
        .measurements=${this.measurements}
        @valuesUpdated=${this.updateApp}></calories-values>
      <calories-ticker
        aria-label="${tdee} ${caption}"
        label="${caption}"
        value="${tdee}"
        ?hidden=${!this.ready}></calories-ticker>
      <calories-zigzag
        ?hidden=${!this.ready}  
        .tdee=${tdee}
        .tdeeMax=${tdeeMax}></calories-zigzag>
      <calories-touch></calories-touch>
    `;
  }
}

