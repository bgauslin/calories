import {LitElement, html} from 'lit';
import {customElement, query, queryAll, state} from 'lit/decorators.js';
import {Formulas} from '../../modules/Formulas';

interface InputRadio {
  factor?: number,
  label: string,
  value: number|string,
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
  @query('#weight') weight: HTMLInputElement;

  @queryAll(':invalid') invalid: HTMLElement[];
  @queryAll('[type="radio"]') radioButtons: HTMLInputElement[];
  @queryAll('radio-marker') radioMarkers: HTMLElement[];

  @state() formulas: Formulas;
  @state() imperial: boolean = false;
  @state() ready: boolean = false;
  @state() storageItem: string = 'values';
  
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
   * Populates inputs from localStorage..
   */ 
  private async setup() {
    const storage = localStorage.getItem(this.storageItem);

    if (storage) {
      await this.updateComplete;
      this.ready = true;

      const {age, activity, goal, height, sex, weight} = JSON.parse(storage);

      // Populate text inputs.
      this.age.value = age;
      this.height.value = height;
      this.weight.value = weight;

      // TODO: Debug inconsistent pre-checked buttons.
      // Pre-check radio buttons.
      for (const button of this.radioButtons) {
        // button.checked = targets.includes(button.id);
        if ([activity, goal, sex].includes(button.id)) {
          button.setAttribute('checked', '');
        } else {
          button.removeAttribute('checked');
        }
      }
    }

    // Wait a tick, then fire a change on each <radio-marker> to set its
    // marker position.
    window.requestAnimationFrame(() => {
      for (const marker of this.radioMarkers) {
        marker.dispatchEvent(new Event('change'));
      }
    });
    
    // Update the chart and total.
    this.updateApp();
  }

  /**
   * Updates results after getting all values and passing them into the BMR,
   * BMI, and TDEE formulas.
   */
  private updateApp() {
    if (this.invalid.length) return;

    // Get user values.
    const formData = new FormData(this.form);
    
    const activity = Number(formData.get('activity')) || 0;
    const age = Number(formData.get('age'));
    const goal = Number(formData.get('goal')) || 0;
    const sex = `${formData.get('sex')}`;

    // Values may need to be converted from Imperial units since the formulas
    // require metric values.
    let height = Number(formData.get('height'));
    let weight = Number(formData.get('weight'));

    if (this.imperial) {
      const feet = Number(formData.get('height'));
      const inches = Number(formData.get('inches'));
      height = this.formulas.cm(feet, inches);
      weight = this.formulas.kg(weight);
    }

    // TODO: Convert from metric to Imperial via checkbox widget.
    console.log('updateApp()');
    console.log({
      activity,
      age,
      goal,
      height,
      sex,
      weight,
    });

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
      age,
      activity: `level-${activity}`,
      goal: `goal-${goal}`,
      height,
      sex,
      weight,
    }));

    // Enable all form elements.
    this.ready = true;
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
      <form @change="${this.updateApp}">
        <fieldset id="sex">
          <h2>Sex</h2>
          ${this.renderRadioButtons(Sex, 'sex')}
        </fieldset>
        
        <fieldset id="measurements">
          ${this.renderTextInputs()}
        </fieldset>

        <fieldset id="activity" ?disabled="${!this.ready}">
          <h2>Exercise (times per week)</h2>
          ${this.renderRadioButtons(ActivityLevel, 'activity', 'level')}
        </fieldset>

        <fieldset id="goal" ?disabled="${!this.ready}">
          <h2>Weight Loss (kg per week)</h2>
          ${this.renderRadioButtons(WeightGoal, 'goal', 'goal')}
        </fieldset>
      <form>
    `;
  }

  /**
   * Renders HTML for a group of radio buttons.
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
        <li class="height">
          <label for="height">Height</label>
          <input
            id="height"  
            inputmode="numeric"
            name="height"
            pattern="[1-3]?[0-9][0-9]"
            type="text"
            required>
          <input
            id="inches"
            inputmode="numeric"
            name="height"
            pattern=""
            type="text"
            ?hidden="${!this.imperial}"
            ?required="${this.imperial}">
        </li>
        <li class="age">
          <label for="age">Age</label>
          <input
            id="age"
            inputmode="numeric"
            name="age"
            pattern="[1-9][0-9]?"
            type="text"
            required>
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
        </li>
      </ul>
    `;

    return inputs;
  }
}
