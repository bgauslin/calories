import {LitElement, html} from 'lit';
import {customElement, query, queryAll, state} from 'lit/decorators.js';
import {Formulas} from '../../modules/formulas';
import {ActivityLevel, Measurements, Sex, WeightGoal} from '../../modules/shared';


/**
 * Web Component that renders fields for user input, converts
 * to/from Imperial units, sends user-provided data up the DOM,
 * and saves the data to localStorage.
 */
@customElement('calories-values')
class UserValues extends LitElement {
  @query('#age') age: HTMLInputElement;
  @query('form') form: HTMLFormElement;
  @query('#height') height: HTMLInputElement;
  @query('#inches') inches: HTMLInputElement;
  @query('#weight') weight: HTMLInputElement;

  @queryAll(':invalid') invalid: HTMLElement[];
  @queryAll('calories-marker') markers: HTMLElement[];

  @state() commas: boolean = false;
  @state() formulas: Formulas;
  @state() imperial: boolean = false;
  @state() measurements: Measurements;
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

    // Set default marker positions in case this is first run.
    this.setMarkers();

    // Try to get local storage and bail early if necessary.
    const storage = localStorage.getItem(this.storageItem);
    if (!storage) return;

    const {commas, imperial, measurements} = JSON.parse(storage);
    if (!measurements) return;

    // User has been here before; get their stored values.
    this.commas = commas;
    this.imperial = imperial;
    const {activity, age, goal, height, sex, weight} = measurements;

    // Populate text inputs from earlier visit.
    this.age.value = age;
    this.height.value = height;

    const weight_ = `${weight}`;
    const weightDisplay = this.commas ? weight_.replace('.', ',') : weight;
    this.weight.value = weightDisplay;
    
    // Override values as needed for Imperial units UX.
    if (this.imperial) {
      const {feet, inches} = this.formulas.heightImperial(height);
      const weightImperial = `${this.formulas.weightImperial(weight)}`;
      const weightDisplay = this.commas ? weightImperial.replace('.', ',') : weightImperial;

      this.height.value = `${feet}`;
      this.inches.value = `${inches}`;
      this.weight.value = weightDisplay;
    }

    // Pre-check radio buttons from earlier visit.
    for (const marker of <HTMLInputElement[]>this.markers) {
      marker.checked = false;
    }

    const elements = [
      ['activity', activity],
      ['goal', goal],
      ['sex', sex],
    ];

    for (const element of elements) {
      const [parent, value] = element;
      const target = <HTMLInputElement>this.querySelector(`[id="${parent}"] input[value="${value}"]`);
      if (target) {
        target.checked = true;
      }
    }

    this.setMarkers();

    // Remove first run guard.
    this.ready = true;

    // Bundle everything up and update the rest of the UX.
    this.measurements = {
      activity,
      age,
      goal,
      height,
      sex,
      weight,
    };    

    this.updateApp();
  }

  /**
   * Waits a tick, then fires a change on each <calories-marker> to set its
   * marker position.
   */
  private setMarkers() {
    window.requestAnimationFrame(() => {
      for (const marker of this.markers) {
        marker.dispatchEvent(new Event('change'));
      }
    });
  }

  /**
   * Sends measurements up the DOM for rendering other UI elements and
   * saves user values for return visits.
   */
  private updateApp() {
    this.dispatchEvent(new CustomEvent('valuesUpdated', {
      bubbles: true,
      composed: true,
      detail: {
        measurements: this.measurements,
      }
    }));

    localStorage.setItem(this.storageItem, JSON.stringify({
      commas: this.commas,
      imperial: this.imperial,
      measurements: this.measurements,
    }));
  }

  /**
   * Converts height and weight to/from metric and Imperial.
   */
  private toggleUnits() {
    this.imperial = !this.imperial;

    if (this.imperial) {
      // Convert metric height to Imperial feet and inches.
      const height = Number(this.height.value);
      if (height) {
        const {feet, inches} = this.formulas.heightImperial(height);
        this.height.value = `${feet}`;
        this.inches.value = `${inches}`;
      }
      
      // Convert metric weight to Imperial lbs.
      const weight_ = `${this.weight.value.replace(',', '.')}`;
      const weight = Number(weight_);
      if (weight) {  
        const weightImperial = `${this.formulas.weightImperial(weight)}`;
        const display = this.commas ? weightImperial.replace('.', ',') : weightImperial;
        this.weight.value = display;
      }

    } else {
      // Convert Imperial height to metric cm.
      const feet = Number(this.height.value);
      const inches = Number(this.inches.value);
      if (feet && inches >= 0) {
        const heightMetric = this.formulas.heightMetric(feet, inches);
        this.height.value = `${heightMetric}`;
      }

      // Convert Imperial weight to metric kg.
      const weight_ = `${this.weight.value.replace(',', '.')}`;
      const weight = Number(weight_);
      if (weight) {
        const weightMetric = `${this.formulas.weightMetric(weight)}`;
        const display = this.commas ? weightMetric.replace('.', ',') : weightMetric;
        this.weight.value = display;
      }
    }

    if (this.measurements) {
      this.updateApp();
    }
  }

  private updateTextValues() {
    let timer;
    clearTimeout(timer);
    timer = setTimeout(() => this.updateAllValues(), 300);
  }

  private updateAllValues() {
    if (this.invalid.length) return;

    // Get user-provided values.
    const formData = new FormData(this.form);

    const activity = Number(formData.get('activity')) || 0;
    const age = Number(formData.get('age'));
    const goal = Number(formData.get('goal')) || 0;
    const sex = `${formData.get('sex')}`;

    // Get weight and set formatting flag if they use commas for decimals.
    const weight_ = `${formData.get('weight')}`;
    const found = weight_.match(/[,]/g);
    this.commas = found && found.length !== 0;
    let weight = Number(weight_.replace(',', '.'));

    // Get height.
    let height = Number(formData.get('height'));

    // Convert values to metric for consistency with formulas.
    if (this.imperial) {
      const feet = Number(formData.get('height'));
      const inches = Number(formData.get('inches'));
      height = this.formulas.heightMetric(feet, inches);
      weight = this.formulas.weightMetric(weight);
    }

    // Send updated values up to the app.
    this.measurements = {
      activity,
      age,
      goal,
      height,
      sex,
      weight,
    }

    this.updateApp();

    // Ensure first run guard is removed.
    this.ready = true;
  }

  protected render() {
    return html`
      <form>
        <fieldset
          id="sex"
          @input="${this.updateAllValues}">
          <h2>Sex</h2>
          ${this.renderRadioButtons(Sex, 'sex', true)}
        </fieldset>
        <fieldset
          id="measurements"
          @input="${this.updateTextValues}">
          ${this.renderTextInputs()}
        </fieldset>
        <fieldset
          id="activity"
          ?disabled="${!this.ready}"
          @input="${this.updateAllValues}">
          <h2>Exercise <span>times per week</span></h2>
          ${this.renderRadioButtons(ActivityLevel, 'activity', false, 'level')}
        </fieldset>
        <fieldset
          id="goal"
          ?disabled="${!this.ready}"
          @input="${this.updateAllValues}">
          <h2>Weight Loss <span>${this.imperial ? 'lbs' : 'kg'} per week</span></h2>
          ${this.renderRadioButtons(WeightGoal, 'goal', false, 'goal')}
        </fieldset>
      <form>
    `;
  }

  private renderToggle() {
    const ariaLabel = this.imperial ? 'Go metric!' : 'Use Imperial units';
    const label =  this.imperial ? 'kg · cm' : 'lbs · ft';
    return html`
      <button
        aria-label="${ariaLabel}"
        id="units"
        type="button"
        @click="${this.toggleUnits}">
        <span>${label}</span>
      </button>
    `;
  }

  private renderRadioButtons(field: any, name: string, enabled: boolean, prefix: string = '') {
    return html`
      <calories-marker>
      ${field.map((item: any, index: number) => {
        const {value, label, labelImperial} = item;
        const id = prefix ? `${prefix}-${value}` : value;
        return html`
          <label for="${id}">
            <input
              ?checked="${index === 0}"
              id="${id}"
              name="${name}"
              tabindex="${this.ready || enabled ? '0' : '-1'}"
              type="radio"
              value="${value}">
            <span>${this.imperial && labelImperial ? labelImperial : label}</span>
          </label>
        `;
      })}
      </calories-marker>
    `;
  }

  private renderTextInputs() {
    return html`
      ${this.renderToggle()}
      <ul>
        <li class="age">
          <label for="age">Age</label>
          <input
            id="age"
            inputmode="numeric"
            name="age"
            pattern="[1-9][0-9]?"
            required
            type="text">
          <span class="units">yrs</span>
        </li>
        <li class="weight">
          <label for="weight">Weight</label>
          <input
            id="weight"
            inputmode="decimal"
            name="weight"
            pattern="[1-3]?[0-9][0-9][,\.]?[0-9]?"
            required
            type="text">
          <span class="units">${this.imperial ? 'lbs' : 'kg'}</span>
        </li>
        <li class="height">
          <label for="height">Height</label>
          <input
            id="height"
            inputmode="numeric"
            name="height"
            pattern="${this.imperial ? '[3-7]' : '[1-2]?[0-9][0-9]'}"
            required
            type="text">
          <span class="units">${this.imperial ? 'ft' : 'cm'}</span>
          <input
            ?hidden="${!this.imperial}"
            id="inches"
            inputmode="numeric"
            name="inches"
            pattern="[0-9]|1[01]"
            ?required="${this.imperial}"
            type="text">
          <span
            class="units"
            ?hidden="${!this.imperial}">in</span>
        </li>
      </ul>
    `;
  }
}
