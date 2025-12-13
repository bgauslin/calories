import {LitElement, html} from 'lit';
import {customElement, property, query, queryAll, state} from 'lit/decorators.js';
import {Formulas} from './formulas';
import {ActivityLevel, Measurements, Sex, WeightGoal, pattern, STORAGE_ITEM, Events} from './shared';


/**
 * Web Component that renders fields for user input, converts
 * to/from Imperial units, and sends user-provided data up the DOM.
 */
@customElement('calories-values') class UserValues extends LitElement {
  private formulas: Formulas;

  @property() commas: boolean = false;
  @property() imperial: boolean = false;
  @property() measurements: Measurements;

  @query('#age') age: HTMLInputElement;
  @query('form') form: HTMLFormElement;
  @query('#height') height: HTMLInputElement;
  @query('#inches') inches: HTMLInputElement;
  @query('#weight') weight: HTMLInputElement;

  @queryAll(':invalid') invalid: HTMLElement[];
  @queryAll('calories-marker') markers: HTMLElement[];

  @state() ready: boolean = false;
  
  constructor() {
    super();
    this.formulas = new Formulas();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  protected createRenderRoot() {
    return this;
  }

  /**
   * Sets default marker positions and populates all fields if there are
   * measurements values from a previous visit.
   */
  protected firstUpdated() {
    // Set the fancy radio button markers.
    this.setMarkers();

    // Bail if there's no data to pre-populate the fields with.
    if (!this.measurements) return;

    // Get measurements and modify as needed for metric/Imperial and
    // comma/period formatting.
    const {activity, age, goal, height, sex, weight} = this.measurements;

    // Populate age input.
    this.age.value = `${age}`;

    // Determine weight in metric units with comma/period formatting, then
    // override with Imperial units if needed.
    const weight_ = `${weight}`;
    let weightDisplay = this.commas ? weight_.replace('.', ',') : weight;

    if (this.imperial) {
      const weightImperial = `${this.formulas.weightImperial(weight)}`;
      weightDisplay = this.commas ? weightImperial.replace('.', ',') : weightImperial;
    } 

    // Populate weight input.
    this.weight.value = `${weightDisplay}`;

    // Populate height input(s).
    if (this.imperial) {
      const {feet, inches} = this.formulas.heightImperial(height);
      this.height.value = `${feet}`;
      this.inches.value = `${inches}`;
    } else {
      this.height.value = `${height}`;
    }

    // Check radio button inputs.
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

    // Check radio button markers and activate them.
    for (const marker of <HTMLInputElement[]>this.markers) {
      marker.checked = false;
    }
    this.setMarkers();

    // All set, enable the radio buttons.
    this.ready = true;
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
   * Sends everything up to the app so it can render other elements and save
   * the data for return visits.
   */
  private notifyApp() {
    this.dispatchEvent(new CustomEvent(Events.Values, {
      detail: {
        commas: this.commas,
        imperial: this.imperial,
        measurements: this.measurements,
      }
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
      this.notifyApp();
    }
  }

  /**
   * Debounces text input fields.
   */
  private getTextValues() {
    let timer;
    clearTimeout(timer);
    timer = setTimeout(() => this.getFormValues(), 300);
  }

  /**
   * Gets all form field values, determines comma/period formatting, and sends
   * everything up to the app.
   */
  private getFormValues() {
    if (this.invalid.length) return;

    // Enable the radio buttons.
    this.ready = true;

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
    
    // Get weight.
    let weight = Number(weight_.replace(',', '.'));

    // Get height.
    let height = Number(formData.get('height'));

    // Convert height and weight to metric for consistency with formulas.
    if (this.imperial) {
      const feet = Number(formData.get('height'));
      const inches = Number(formData.get('inches'));
      height = this.formulas.heightMetric(feet, inches);
      weight = this.formulas.weightMetric(weight);
    }

    // Bundle updated values and send it off.
    this.measurements = {
      activity,
      age,
      goal,
      height,
      sex,
      weight,
    }
    this.notifyApp();
  }

  protected render() {
    return html`
      <form>
        <fieldset
          id="sex"
          @input=${this.getFormValues}>
          <h2>Sex</h2>
          ${this.renderRadioButtons(Sex, 'sex', true)}
        </fieldset>
        <fieldset
          id="measurements"
          @input=${this.getTextValues}>
          ${this.renderTextInputs()}
        </fieldset>
        <fieldset
          id="activity"
          ?disabled=${!this.ready}
          @input=${this.getFormValues}>
          <h2>Exercise <span>times per week</span></h2>
          ${this.renderRadioButtons(ActivityLevel, 'activity', false, 'level')}
        </fieldset>
        <fieldset
          id="goal"
          ?disabled=${!this.ready}
          @input=${this.getFormValues}>
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
        @click=${this.toggleUnits}>
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
              id="${id}"
              name="${name}"
              tabindex="${this.ready || enabled ? '0' : '-1'}"
              type="radio"
              value="${value}"
              ?checked=${index === 0}>
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
            pattern="${pattern.age}"
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
            pattern="${this.imperial ? pattern.weight.imperial : pattern.weight.metric}"
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
            pattern="${this.imperial ? pattern.height.imperial.feet : pattern.height.metric}"
            type="text"
            required>
          <span class="units">${this.imperial ? 'ft' : 'cm'}</span>
          <input
            id="inches"
            inputmode="numeric"
            name="inches"
            pattern="${pattern.height.imperial.inches}"
            type="text"
            ?hidden=${!this.imperial}
            ?required=${this.imperial}>
          <span
            class="units"
            ?hidden=${!this.imperial}>in</span>
        </li>
      </ul>
    `;
  }
}
