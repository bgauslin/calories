import {LitElement, html} from 'lit';
import {customElement, query, queryAll, state} from 'lit/decorators.js';
import {Formulas} from '../../modules/Formulas';

interface InputRadio {
  factor?: number,
  label: string,
  value: number|string,
}

interface Measurements {
  age: number,
  activity: number,
  goal: number,
  height: number,
  sex: string,
  weight: number,
}

const ActivityLevel: InputRadio[] = [
  {value: 0, label: 'None', factor: 1},
  {value: 3, label: '3', factor: 1.1455},
  {value: 4, label: '4', factor: 1.1819},
  {value: 5, label: '5', factor: 1.2188},
  {value: 7, label: 'Daily', factor: 1.2916},
];

const Sex: InputRadio[] = [
  {value: 'male', label: 'Male'},
  {value: 'female', label: 'Female'},
];

// TODO: Display different label for Imperial units.
const WeightGoal: InputRadio[] = [
  {value: 0, label: 'None', factor: 0},
  {value: 1, label: '¼', factor: 250},  // imperial: '½'
  {value: 2, label: '½', factor: 500},  // imperial: '1'
  {value: 3, label: '¾', factor: 750},  // imperial: '1½'
  {value: 4, label: '1', factor: 1000}, // imperial: '2'
];

/**
 * Custom element that renders input fields for user interaction, calculates
 * BMR and TDEE via user input, enables/disables a 'results' element based on
 * valid user input, and saves user-provided data to localStorage.
 */
@customElement('user-values')
class UserValues extends LitElement {
  @query('form') form: HTMLFormElement;
  @query('#age') age: HTMLInputElement;
  @query('#height') height: HTMLInputElement;
  @query('#inches') inches: HTMLInputElement;
  @query('#weight') weight: HTMLInputElement;

  @queryAll(':invalid') invalid: HTMLElement[];
  @queryAll('[type="radio"]') radioButtons: HTMLInputElement[];
  @queryAll('radio-marker') radioMarkers: HTMLElement[];

  @state() formulas: Formulas;
  @state() imperial: boolean = false;
  @state() ready: boolean = false;
  @state() storageItem: string = 'values';
  @state() weightUnit: string = 'kg';
  
  constructor() {
    super();
    this.formulas = new Formulas();
    this.addEventListener('keyup', this.handleKey);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setup();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keyup', this.handleKey);
  }

  protected createRenderRoot() {
    return this;
  }

  /**
   * Populates inputs from localStorage.
   */ 
  private async setup() {
    await this.updateComplete;
    this.setMarkers();

    const storage = localStorage.getItem(this.storageItem);

    if (!storage) return;

    const {age, activity, goal, height, sex, weight} = JSON.parse(storage);

    // Populate text inputs from earlier visit.
    this.age.value = age;
    this.height.value = height;
    this.weight.value = weight;

    // Pre-check radio buttons from earlier visit.
    for (const marker of <HTMLInputElement[]>this.radioMarkers) {
      marker.checked = false;
    }

    const elements = [
      [activity, '#activity'],
      [goal, '#goal'],
      [sex, '#sex'],
    ];

    for (const element of elements) {
      const [value, parent] = element;
      const target = <HTMLInputElement>this.querySelector(`${parent} input[value="${value}"]`);
      if (target) {
        target.checked = true;
      }
    }

    this.setMarkers();

    // Bundle everything up for sending up to the app.
    const measurements = {
      age,
      activity,
      goal,
      height,
      sex,
      weight,
    };    
    
    // Update the chart.
    this.updateApp(measurements);
    this.ready = true;
  }

  /**
   * Waits a tick, then fires a change on each <radio-marker> to set its
   * marker position.
   */
  private setMarkers() {
    window.requestAnimationFrame(() => {
      for (const marker of this.radioMarkers) {
        marker.dispatchEvent(new Event('change'));
      }
    });
  }

  /**
   * Updates results after getting all values and passing them into the BMR,
   * BMI, and TDEE formulas.
   */
  private updateApp(measurements: Measurements) {
    const {activity, age, goal, height, sex, weight} = measurements;

    // Get BMR and factors based on selected values, then TDEE and maximum TDEE
    // for zig-zag chart.
    const bmr = this.formulas.basalMetabolicRate({age, height, sex, weight});
    const activityLevel = ActivityLevel.find(level => activity === level.value);
    const goalLevel = WeightGoal.find(level => goal === level.value);

    const tdee = this.formulas.totalDailyEnergyExpenditure({
      activity: activityLevel.factor,
      bmr,
      goal: goalLevel.factor,
    });

    const tdeeMax = this.formulas.totalDailyEnergyExpenditure({
      activity: ActivityLevel[ActivityLevel.length - 1].factor,
      bmr,
      goal: WeightGoal[0].factor,
    });
    
    // Send new values up to app controller.
    this.dispatchEvent(new CustomEvent('valuesUpdated', {
      bubbles: true,
      composed: true,
      detail: {
        bmr,
        tdee,
        tdeeMax,
      }
    }));

    // Store values for return visits.
    localStorage.setItem(this.storageItem, JSON.stringify({
      activity,
      age,
      goal,
      height,
      sex,
      weight,
    }));
  }

  private toggleUnits() {
    this.imperial = !this.imperial;

    if (this.imperial) {
      const height = Number(this.height.value);
      const {feet, inches} = this.formulas.heightImperial(height);
      const weight = Number(this.weight.value);
      
      this.height.value = feet;
      this.inches.value = inches;
      this.weight.value = `${this.formulas.weightImperial(weight)}`;
    } else {
      const feet = Number(this.height.value);
      const inches = Number(this.inches.value);
      const weight = Number(this.weight.value);

      this.weight.value = `${this.formulas.weightMetric(weight)}`;
      this.height.value = `${this.formulas.heightMetric(feet, inches)}`;      
    }
  }

  private getFormData() {
    if (this.invalid.length) return;

    this.ready = true;

    // Get user-provided values.
    const formData = new FormData(this.form);

    // Values as-is.
    const age = Number(formData.get('age'));
    const sex = `${formData.get('sex')}`;

    const activity = Number(formData.get('activity')) || 0;
    const goal = Number(formData.get('goal')) || 0;
    
    // Values may need to be converted from Imperial units since the formulas
    // require metric values.
    let height = Number(formData.get('height'));
    let weight = Number(formData.get('weight'));

    // Convert saved metric values to Imperial units.
    if (this.imperial) {
      const feet = Number(formData.get('height'));
      const inches = Number(formData.get('inches'));
      height = this.formulas.heightMetric(feet, inches);
      weight = this.formulas.weightMetric(weight);
    }

    const measurements = {
      age,
      activity: Number(activity),
      goal: Number(goal),
      height,
      sex,
      weight,
    }

    this.updateApp(measurements);
  }

  /**
   * Adds [enter] key functionality to radio buttons.
   */
  private handleKey(event: KeyboardEvent) {
    const target = <HTMLElement>event.target;
    const radio = target.querySelector('input[type=radio]');
    if (radio && event.code === 'Enter') {
      target.click();
    }
  }

  /**
   * Renders HTML for user-provided values.
   */
  protected render() {
    return html`
      <label for="units">
        <input
          id="units"
          type="checkbox"
          @click="${this.toggleUnits}">
      </label>

      <form
        ?data-imperial="${this.imperial}"
        @change="${this.getFormData}">
        <fieldset id="sex">
          <h2>Sex</h2>
          ${this.renderRadioButtons(Sex, 'sex')}
        </fieldset>
        
        <fieldset id="measurements">
          ${this.renderTextInputs()}
        </fieldset>

        <fieldset id="activity" ?disabled="${!this.ready}">
          <h2>Exercise <span>times per week</span></h2>
          ${this.renderRadioButtons(ActivityLevel, 'activity', 'level')}
        </fieldset>

        <fieldset id="goal" ?disabled="${!this.ready}">
          <h2>Weight Loss <span>${this.weightUnit} per week</span></h2>
          ${this.renderRadioButtons(WeightGoal, 'goal', 'goal')}
        </fieldset>
      <form>
    `;
  }

  /**
   * Renders HTML for a group of radio buttons.
   * TODO: Update 'any' types to proper type.
   */
  private renderRadioButtons(field: any, name: string, prefix: string = '') {
    return html`
      <radio-marker>
      ${field.map((item: any, index: number) => {
        const {value, label} = item;
        const id = prefix ? `${prefix}-${value}` : value;

        return html`
          <label for="${id}" tabindex="${this.ready ? '0' : '-1'}">
            <input
              type="radio"
              name="${name}"
              id="${id}"
              value="${value}"
              tabindex="${this.ready ? '0' : '-1'}"
              ?checked="${index === 0}">
            <span>${label}</span>
          </label>
        `;
      })}
      </radio-marker>
    `;
  }

  /**
   * Renders HTML for a group on input fields.
   */
  private renderTextInputs() {
    const inputs = html`
      <ul>
        <li class="age">
          <label for="age">Age</label>
          <input
            id="age"
            inputmode="numeric"
            name="age"
            pattern="[1-9][0-9]?"
            type="text"
            required>
          <span class="units">yrs</span>
        </li>
        <li class="height">
          <label for="height">Height</label>
          <input
            id="height"
            inputmode="numeric"
            name="height"
            pattern="${this.imperial ? '[3-7]' : '[1-3]?[0-9][0-9]'}"
            type="text"
            required>
          <span class="units">${this.imperial ? 'ft' : 'cm'}</span>
          <input
            id="inches"
            inputmode="numeric"
            name="height"
            pattern="[0-9]|1[01]"
            type="text"
            ?hidden="${!this.imperial}"
            ?required="${this.imperial}">
          <span
            class="units"
            ?hidden="${!this.imperial}">in</span>
        </li>
        <li class="weight">
          <label for="weight">Weight</label>
          <input
            id="weight"
            inputmode="decimal"
            name="weight"
            pattern="[0-9]{0,3}[\.]?[0-9]?"
            type="text"
            required>
          <span class="units">${this.imperial ? 'lb' : 'kg'}</span>
        </li>
      </ul>
    `;

    return inputs;
  }
}
