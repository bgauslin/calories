import {ActivityLevel, Measurements, Sex, WeightGoal} from '../../modules/Datasets';
import {Formulas} from '../../modules/Formulas';

interface UserMeasurements {
  activity: string,
  age: number,
  feet: number,
  goal: string,
  inches: number,
  sex: string,
  weight: number,
}

interface UserResults {
  bmr: number,
  tdee: number,
  tdeeMax: number,
}

enum OptionsGroup {
  ACTIVITY = 'activity',
  GOAL = 'goal',
  SEX = 'sex',
}

/**
 * Custom element that renders input fields for user interaction, calculates
 * BMR and TDEE via user input, enables/disables a 'results' element based on
 * valid user input, and saves user-provided data to localStorage.
 */
class UserValues extends HTMLElement {
  private fields: string[];
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
    // Create array of all fields to simplify getting/setting things later.
    const measurementFields = Measurements.map(field => field.name);
    this.fields = [
      ...measurementFields,
      ...Object.values(OptionsGroup),
    ];

    // Render HTML and create element references.
    // If user data exists, update elements with that data.
    this.render();
    this.populateInputs();

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
   * Renders HTML for all input groups.
   */
  private render() {
    const fields = {
      activityLevel: {
        buttons: ActivityLevel,
        disabled: true,
        headingLabel: 'Exercise',
        headingNote: 'times per week',
        modifier: 'activity',
        name: OptionsGroup.ACTIVITY,
      },
      measurements: Measurements,
      sex: {
        buttons: Sex,
        headingLabel: 'Sex',
        modifier:  'sex',
        name: OptionsGroup.SEX,
      },
      weightGoal: {
        buttons: WeightGoal,
        disabled: true,
        headingLabel: 'Weight loss',
        headingNote: 'lbs. per week',
        modifier: 'goal',
        name: OptionsGroup.GOAL,
      },
    };

    const {activityLevel, measurements, sex, weightGoal} = fields;
    this.innerHTML = `
      <form>
        ${this.renderRadioButtons(sex, 'sex')}
        ${this.renderTextInputs(measurements, 'measurements')}
        ${this.renderRadioButtons(activityLevel, 'activity')}
        ${this.renderRadioButtons(weightGoal, 'goal')}
      <form>
    `;

    this.form = this.querySelector('form')!;
  }

  /**
   * Renders HTML for a group of radio buttons.
   */
  private renderRadioButtons(field: any, modifier: string) {
    const {buttons, disabled, headingLabel, headingNote, name} = field;
    
    let options = ''
    for (const [index, button] of buttons.entries()) {
      const checkedAttr = (index === 0) ? 'checked' : '';
      const {id, label, value} = button;
      options += `
        <label for="${id}" tabindex="0">
          <input type="radio" name="${name}" id="${id}" value="${value}" tabindex="-1" ${checkedAttr}>
          <span>${label}</span>
        </label>
      `;
    }

    const note = headingNote ? `<span>${headingNote}</span>` : '';
    const disabledAttr = disabled ? 'disabled' : '';
    const html = `
      <fieldset id="${modifier}" ${disabledAttr}>
        <h2>${headingLabel}${note}</h2>
        <radio-marker>${options}</radio-marker>
      </fieldset>
    `;

    return html;
  }

  /**
   * Renders HTML for a group of text inputs.
   */
  private renderTextInputs(list: any, modifier: string): string {
    let items = '';
    for (const item of list) {
      const {id, inputmode, label, name, pattern} = item;
      items += `
        <li class="${id}">
          <label for="${id}">${label}</label>
          <input type="text" name="${name}" id="${id}" inputmode="${inputmode}" pattern="${pattern}" required>
        </li>
      `;
    }

    const html = `
      <fieldset id="${modifier}">
        <ul>${items}</ul>
      </fieldset>
    `;

    return html;
  }

  /**
   * Converts stored user-provided values to an array, then populates each input
   * element with its corresponding user value.
   */
  private populateInputs() {
    const storageItem = localStorage.getItem(this.storageItem);
    if (!storageItem) {
      return;
    }

    const stored = JSON.parse(storageItem);
    for (const name of this.fields) {
      const inputElements = this.querySelectorAll(`input[name=${name}]`);
      for (const element of inputElements) {
        const input = <HTMLInputElement>element;
        switch (input.type) {
          case 'number':
          case 'text':
            input.value = stored[name];
            break;
          case 'radio':
            input.checked = input.value === stored[name];
            break;
        }
      }
    }
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
    const feet = Number(formData.get('feet'));
    const goal = formData.get('goal') || 0;
    const inches = Number(formData.get('inches'));
    const sex = `${formData.get('sex')}`;
    const weight = Number(formData.get('weight'));

    return {
      activity: `${activity}`,
      age,
      feet,
      goal: `${goal}`,
      inches,
      sex,
      weight,
    }
  }

  /**
   * Returns user's BMR, TDEE, and max TDEE based on their measurements.
   */
  private getResults(measurements: UserMeasurements): UserResults {
    let {activity, age, feet, goal, inches, sex, weight} = measurements;

    // Convert height and weight to metric for the formulas.
    const height = this.formulas.cm((feet * 12) + inches);
    weight = this.formulas.kg(weight);

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
  private handleKey(e: KeyboardEvent) {
    const target = <HTMLElement>e.target;
    const radio = target.querySelector('input[type=radio]');
    if (radio && e.code === 'Enter') {
      target.click();
    }
  }

  /**
   * Places the cursor at the end of a text input field when it's focused.
   */
  private handleInputFocus() {
    const names = Measurements.map(field => field.name);
    for (const name of names) {
      const element = <HTMLInputElement>this.querySelector(`[name=${name}]`);
      element.addEventListener('focus', () => {
        element.selectionStart = element.selectionEnd = element.value.length;
      });
    }
  }
}

customElements.define('user-values', UserValues);
