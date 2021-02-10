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

const DISABLED_ATTR: string = 'disabled';
const HIDDEN_ATTR: string = 'hidden';
const LOCAL_STORAGE: string = 'values';

const DISABLED_ELEMENTS: string[] = [
  '.values__group--activity',
  '.values__group--goal',
];

enum OptionsGroup {
  ACTIVITY = 'activity',
  GOAL = 'goal',
  SEX = 'sex',
}

/**
 * Custom element that renders input fields for user interaction, calculates
 * BMR and TDEE via user input, enables/disables a 'results' element based on
 * valid user input, and saves user-provided info to localStorage.
 */
class UserValues extends HTMLElement {
  private allFields: string[];
  private formEl: HTMLFormElement;
  private formulas: Formulas;
  private hasSetup: boolean;
  private resultsEl: HTMLElement;
  private storage: string;

  constructor() {
    super();
    this.hasSetup = false;
    this.formulas = new Formulas();
    this.storage = localStorage.getItem(LOCAL_STORAGE);
    this.addEventListener('change', this.update);
    this.addEventListener('keyup', this.handleKey);
  }

  static get observedAttributes(): string[] {
    return ['units'];
  }

  connectedCallback() {
    this.setup();
  }

  attributeChangedCallback() {
    if (this.hasSetup) {
      this.update();
    }
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.update);
    this.removeEventListener('keyup', this.handleKey);
  }

  /**
   * Creates DOM elements and populates them if there are stored user values.
   */
  private setup() {
    // Create array of all fields to simplify getting/setting things later.
    const measurementFields = Measurements.map(field => field.name);
    this.allFields = [
      ...measurementFields,
      ...Object.values(OptionsGroup),
    ];

    // Render HTML for input groups and results.
    this.render();

    // Create references to primary elements.
    this.formEl = this.querySelector('form');
    this.resultsEl = this.querySelector('.results');

    // If user data exists, update HTML on page load.
    if (this.storage) {
      this.populateInputs();
    }

    // Focus first text input if it's empty.
    const first = this.querySelector('[type=text]') as HTMLInputElement;
    if (!first.value.length) {
      first.focus();
    }

    // Set attribute on each fancy-marker which will trigger it to set its
    // marker position and the result element's visibility.
    [...this.querySelectorAll('fancy-marker')].forEach((marker) => {
      marker.setAttribute('init', '');
    });
    
    // Add focus/blur listeners to text inputs.
    this.handleInputFocus();

    // All done.
    this.hasSetup = true;
    this.update();
  }

  /**
   * Renders HTML for all input groups and results.
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

    const userValuesTemplate = require('./user_values.pug');
    this.innerHTML = userValuesTemplate({fields: fields});
  }

  /**
   * Converts stored user-provided values to an array, then populates each input
   * element with its corresponding user value.
   */
  private populateInputs() {
    const stored = JSON.parse(this.storage);
    this.allFields.forEach((name) => {
      const inputEls = this.querySelectorAll(`[name=${name}]`);
      inputEls.forEach((el: Element) => {
        const input = el as HTMLInputElement
        switch (input.type) {
          case 'number':
          case 'text':
            input.value = stored[name];
            break;
          case 'radio':
            input.checked = (input.value === stored[name]);
            break;
        }
      });
    });
  }

  /**
   * Updates results after getting all values and passing them into the BMR,
   * BMI, and TDEE formulas.
   */
  private update() {
    if (this.querySelectorAll(':invalid').length) {
      // Hide results and disable input groups.
      this.resultsEl.setAttribute(HIDDEN_ATTR, '');
      this.enableOptionsGroups(false);
    } else {
      // Get user measurements and save them for subsequent visits.
      const measurements = this.getMeasurements()
      const {bmr, tdee, tdeeMax} = this.getResults(measurements);
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(measurements));

      // Show results and enable input groups.
      this.showResults(bmr, tdee, tdeeMax);
      this.enableOptionsGroups(true);
    }   
  }

  /**
   * Returns user's age, height, sex, and weight from form inputs.
   */
  private getMeasurements(): UserMeasurements {
    const values = {};
    const formData = new FormData(this.formEl);
    this.allFields.forEach((name) => values[name] = formData.get(name));

    return {
      activity: values['activity'],
      age: Number(values['age']),
      feet: Number(values['feet']),
      goal: values['goal'],
      inches: Number(values['inches']),
      sex: values['sex'],
      weight: values['weight'],
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

    // Get BMR.
    const bmr = this.formulas.basalMetabolicRate({age, height, sex, weight});

    // Get factors based on selected values for TDEE.
    const activityLevel = ActivityLevel.find(level => activity === level.value);
    const goalLevel = WeightGoal.find(level => goal === level.value);

    // Get Total Daily Energy Expenditure (TDEE).
    const tdee = this.formulas.totalDailyEnergyExpenditure({
      activity: activityLevel.factor,
      bmr,
      goal: goalLevel.factor,
    });

    // Get maximum TDEE for zig-zag chart (maximum activity, no weight loss).
    const tdeeMax = this.formulas.totalDailyEnergyExpenditure({
      activity: ActivityLevel[ActivityLevel.length - 1].factor,
      bmr,
      goal: WeightGoal[0].factor,
    });

    return {bmr, tdee, tdeeMax};
  }

  /**
   * Sets attributes on results and zig-zag elements so that they can
   * update themselves.
   */
  private showResults(bmr: number, tdee: number, tdeeMax: number) {
    this.resultsEl.removeAttribute(HIDDEN_ATTR);
    this.resultsEl.setAttribute('value', tdee.toFixed(0));
    this.resultsEl.setAttribute('bmr', bmr.toFixed(0));
 
    const zigZag = document.querySelector('zig-zag')
    zigZag.setAttribute('tdee', tdee.toFixed());
    zigZag.setAttribute('max-tdee', tdeeMax.toFixed());
  }

  /**
   * Toggles 'disabled' attribute on input groups and sets a 'tabindex' value
   * on their children's labels to enable/disable keyboard tabbing.
   */
  private enableOptionsGroups(enabled: boolean) {
    const tabindex = enabled ? '0' : '-1';

    DISABLED_ELEMENTS.forEach((selector) => {
      const group = this.querySelector(selector);

      if (enabled) {
        group.removeAttribute(DISABLED_ATTR);
      } else {
        group.setAttribute(DISABLED_ATTR, '');
      }

      [...group.querySelectorAll('label[tabindex]')].forEach((label) => {
        label.setAttribute('tabindex', tabindex);
      });
    });
  }

  /**
   * Adds [enter] key functionality to radio buttons.
   */
  private handleKey(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const radio = target.querySelector('[type=radio]');
    if (radio && e.code === 'Enter') {
      target.click();
    }
  }

  /**
   * Places the cursor at the end of a text input field when it's focused.
   */
  private handleInputFocus() {
    const names = Measurements.map(field => field.name);
    names.forEach((name) => {
      const el = this.querySelector(`[name=${name}]`) as HTMLInputElement;
      el.addEventListener('focus', () => {
        el.selectionStart = el.selectionEnd = el.value.length;
      });
    });
  }
}

customElements.define('user-values', UserValues);
