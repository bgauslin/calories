import {Formulas} from '../../modules/Formulas';

interface UserMeasurements {
  activity: string,
  age: number,
  goal: string,
  height: number,
  sex: string,
  weight: number,
}

interface UserResults {
  bmr: number,
  tdee: number,
  tdeeMax: number,
}

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
class UserValues extends HTMLElement {
  private form: HTMLFormElement;
  private formulas: Formulas;
  private storageItem: string = 'values';

  constructor() {
    super();
    this.formulas = new Formulas();
    this.addEventListener('change', this.update, true);
    this.addEventListener('keyup', this.handleKey);
  }

  connectedCallback() {
    this.setup();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.update);
    this.removeEventListener('keyup', this.handleKey);
  }

  /**
   * Renders DOM elements and populates them if there are stored values.
   */
  private setup() {
    this.render();
    // this.populateInputs();

    // Wait a tick, then fire a change on each <radio-marker> to set its
    // marker position.
    window.requestAnimationFrame(() => {
      const radioMarkers = this.querySelectorAll('radio-marker');
      for (const element of radioMarkers) {
        element.dispatchEvent(new Event('change'));
      }
    });

    // Show results and graph if there are valid values.
    this.update();
  }

  /**
   * Updates results after getting all values and passing them into the BMR,
   * BMI, and TDEE formulas.
   */
  private update() {
    if (this.querySelectorAll(':invalid').length) {
      this.enableOptionsGroups(false);
      return;
    }

    const measurements = this.getMeasurements();
    const {bmr, tdee, tdeeMax} = this.getResults(measurements);

    this.dispatchEvent(new CustomEvent('valuesUpdated', {
      bubbles: true,
      composed: true,
      detail: {
        bmr,
        tdee,
        tdeeMax,
      }
    }));
    this.enableOptionsGroups(true);
    localStorage.setItem(this.storageItem, JSON.stringify(measurements));
  }

  /**
   * Returns user's age, height, sex, and weight from form inputs.
   */
  private getMeasurements(): UserMeasurements {
    const formData = new FormData(this.form);

    const activity = formData.get('activity') || 0;
    const age = Number(formData.get('age'));
    const goal = formData.get('goal') || 0;
    const height = Number(formData.get('height'));
    const sex = `${formData.get('sex')}`;
    const weight = Number(formData.get('weight'));

    return {
      activity: `${activity}`,
      age,
      goal: `${goal}`,
      height,
      sex,
      weight,
    }
  }

  /**
   * Returns user's BMR, TDEE, and max TDEE based on their measurements.
   */
  private getResults(measurements: UserMeasurements): UserResults {
    let {activity, age, goal, height, sex, weight} = measurements;

    // TODO: Convert from metric to Imperial via checkbox widget.
    //
    // Convert height and weight to metric for the formulas.
    // if (imperial) {
    //   height = this.formulas.cm((feet * 12) + inches);
    //   weight = this.formulas.kg(weight);
    // }

    // Get BMR and factors based on selected values, then TDEE and maximum TDEE
    // for zig-zag chart.
    const bmr = this.formulas.basalMetabolicRate({age, height, sex, weight});
    const activityLevel = ActivityLevel.find(level => parseInt(activity) === level.value);
    const goalLevel = WeightGoal.find(level => parseInt(goal) === level.value);

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

    return {bmr, tdee, tdeeMax};
  }

  /**
   * Toggles 'disabled' attribute on input groups and sets a 'tabindex' value
   * on their children's labels to enable/disable keyboard tabbing.
   */
  private enableOptionsGroups(enabled: boolean) {
    const tabindex = enabled ? '0' : '-1';

    for (const selector of ['#activity', '#goal']) {
      const group = this.querySelector(selector);

      if (enabled) {
        group!.removeAttribute('disabled');
      } else {
        group!.setAttribute('disabled', '');
      }

      const labels = group!.querySelectorAll('label[tabindex]');
      for (const label of labels) {
        label.setAttribute('tabindex', tabindex);
      }
    }
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
  private render() {
    this.innerHTML = `
      <form>
        <fieldset id="sex">
          <h2>Sex</h2>
          ${this.renderRadioButtons(Sex, 'sex')}
        </fieldset>
        
        <fieldset id="measurements">
          ${this.renderTextInputs()}
        </fieldset>

        <fieldset id="activity" disabled>
          <h2>Exercise (times per week)</h2>
          ${this.renderRadioButtons(ActivityLevel, 'activity', 'level')}
        </fieldset>

        <fieldset id="goal" disabled>
          <h2>Weight Loss (kg per week)</h2>
          ${this.renderRadioButtons(WeightGoal, 'goal', 'goal')}
        </fieldset>
      <form>
    `;

    this.form = this.querySelector('form')!;
  }

  /**
   * Renders HTML for a group of radio buttons.
   */
  private renderRadioButtons(field: any, name: string, prefix: string = '') {
    let html = '<radio-marker>';
    for (const [index, button] of field.entries()) {
      const checked = (index === 0) ? 'checked' : '';
      const {label, value} = button;
      const id = prefix ? `${prefix}-${value}` : value;

      html += `
        <label for="${id}" tabindex="0">
          <input type="radio" name="${name}" id="${id}" value="${value}" tabindex="-1" ${checked}>
          <span>${label}</span>
        </label>
      `;
    }
    html += '</radio-marker>';

    return html;
  }

  /**
   * Renders HTML for a group on input fields.
   */
  private renderTextInputs() {
    const html = `
      <ul>
        <li class="height">
          <label for="height">Height</label>
          <input
            id="height"  
            inputmode="numeric"
            name="height"
            pattern="[1-3]?[0-9][0-9]"
            required
            type="text">
        </li>
        <li class="age">
          <label for="age">Age</label>
          <input
            id="age"
            inputmode="numeric"
            name="age"
            pattern="[1-9][0-9]?"
            required
            type="text">
        </li>
        <li class="weight">
          <label for="weight">Weight</label>
          <input
            id="weight"
            inputmode="decimal"
            name="weight"
            pattern="[0-9]{0,3}[\.]?[0-9]?"
            required
            type="text">
        </li>
      </ul>
    `;

    return html;
  }
}

customElements.define('user-values', UserValues);
