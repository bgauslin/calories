import {LitElement, html} from 'lit';
import {customElement, query, queryAll, state} from 'lit/decorators.js';
import {Formulas} from '../../modules/Formulas';
import {ActivityLevel, Measurements, Sex, WeightGoal} from '../../modules/shared';

/**
 * Custom element that renders input fields for user interaction, calculates
 * BMR and TDEE via user input, enables/disables a 'results' element based on
 * valid user input, and saves user-provided data to localStorage.
 */
@customElement('user-values')
class UserValues extends LitElement {
  @query('#age') age: HTMLInputElement;
  @query('form') form: HTMLFormElement;
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
  
  constructor() {
    super();
    this.formulas = new Formulas();
  }

  connectedCallback() {
    super.connectedCallback();
    this.setup();
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

    const {activity, age, goal, height, imperial, sex, weight} = JSON.parse(storage);

    this.imperial = imperial;

    // Populate text inputs from earlier visit.
    this.age.value = age;
    
    if (this.imperial) {
      const {feet, inches} = this.formulas.heightImperial(height);
      const weightImperial = this.formulas.weightImperial(weight);

      this.height.value = `${feet}`;
      this.inches.value = `${inches}`;
      this.weight.value = `${weightImperial}`;

    } else {
      this.height.value = height;
      this.weight.value = weight;
    }

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

    // Bundle everything up and update the app.
    const measurements = {
      activity,
      age,
      goal,
      height,
      sex,
      weight,
    };    

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

    // Send new values up to app controller.
    this.dispatchEvent(new CustomEvent('valuesUpdated', {
      bubbles: true,
      composed: true,
      detail: {
        activity,
        age,
        goal,
        height,
        sex,
        weight,
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
      imperial: this.imperial,
    }));
  }

  private toggleUnits() {
    this.imperial = !this.imperial;

    if (this.imperial) {
      // Convert height to Imperial feet and inches.
      const height = Number(this.height.value);
      
      if (height) {
        const {feet, inches} = this.formulas.heightImperial(height);
        this.height.value = `${feet}`;
        this.inches.value = `${inches}`;
      }
      
      // Convert metric weight to Imperial lbs.
      const weight = Number(this.weight.value);

      if (weight) {
        const weightImperial = this.formulas.weightImperial(weight);
        this.weight.value = `${weightImperial}`;
      }
    } else {
      // Convert Imperial height to metric cm.
      const feet = Number(this.height.value);
      const inches = Number(this.inches.value);
      
      if (feet && inches) {
        const heightMetric = this.formulas.heightMetric(feet, inches);
        this.height.value = `${heightMetric}`;
      }

      // Convert Imperial weight to metric kg.
      const weight = Number(this.weight.value);
      if (weight) {
        const weightMetric = this.formulas.weightMetric(weight);
        this.weight.value = `${weightMetric}`;
      }
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

    if (this.imperial) {
      const feet = Number(formData.get('height'));
      const inches = Number(formData.get('inches'));
      height = this.formulas.heightMetric(feet, inches);
      weight = this.formulas.weightMetric(weight);
    }

    const measurements = {
      activity,
      age,
      goal,
      height,
      sex,
      weight,
    }

    this.updateApp(measurements);
  }

  /**
   * Renders HTML for user-provided values.
   */
  protected render() {
    return html`
      <form @change="${this.getFormData}">
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
          <h2>Weight Loss <span>${this.imperial ? 'lbs' : 'kg'} per week</span></h2>
          ${this.renderRadioButtons(WeightGoal, 'goal', 'goal')}
        </fieldset>
      <form>
    `;
  }

  private renderToggle() {
    return html`
      <label for="units">
      <input
        id="units"
        type="checkbox"
        @click="${this.toggleUnits}">
        <span>${this.imperial ? 'kg · cm' : 'lbs · ft'}</span>
      </label>
    `;
  }

  /**
   * Renders HTML for a group of radio buttons.
   */
  private renderRadioButtons(field: any, name: string, prefix: string = '') {
    return html`
      <radio-marker>
      ${field.map((item: any, index: number) => {
        const {value, label, labelImperial} = item;
        const id = prefix ? `${prefix}-${value}` : value;

        return html`
          <label for="${id}" tabindex="${this.ready ? '0' : '-1'}">
            <input
              id="${id}"
              name="${name}"
              tabindex="${this.ready ? '0' : '-1'}"
              type="radio"
              value="${value}"
              ?checked="${index === 0}">
            <span>${this.imperial && labelImperial ? labelImperial : label}</span>
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
      ${this.renderToggle()}
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
        <li class="weight">
          <label for="weight">Weight</label>
          <input
            id="weight"
            inputmode="decimal"
            name="weight"
            pattern="[0-9]{0,3}[\.]?[0-9]?"
            type="text"
            required>
          <span class="units">${this.imperial ? 'lbs' : 'kg'}</span>
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
            name="inches"
            pattern="[0-9]|1[01]"
            type="text"
            ?hidden="${!this.imperial}"
            ?required="${this.imperial}">
          <span
            class="units"
            ?hidden="${!this.imperial}">in</span>
        </li>
      </ul>
    `;

    return inputs;
  }
}
