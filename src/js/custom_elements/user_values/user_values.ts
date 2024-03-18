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

const DISABLED_ATTR = 'disabled';
const HIDDEN_ATTR = 'hidden';
const STORAGE_ITEM = 'values';

const DISABLED_ELEMENTS: string[] = [
  '#activity',
  '#goal',
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
  private fields: string[];
  private form: HTMLFormElement;
  private formulas: Formulas;
  private results: HTMLElement;

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
   * Render DOM elements and populates them if there are stored user values.
   */
  private setup() {
    // Create array of all fields to simplify getting/setting things later.
    const measurementFields = Measurements.map(field => field.name);
    this.fields = [
      ...measurementFields,
      ...Object.values(OptionsGroup),
    ];

    // Render HTML and create element references.
    this.render();
    this.form = this.querySelector('form')!;
    this.results = document.getElementById('results')!;

    // If user data exists, update elements with that data, then make each
    // <radio-marker> set its marker's position.
    this.populateInputs();
    const changeEvent = new Event('change');
    const radioMarkers = this.querySelectorAll('radio-marker');
    for (const element of radioMarkers) {
      element.dispatchEvent(changeEvent);
    }

    // Nearly done setting up...
    this.handleInputFocus();
    this.update();

    // Focus the first text input if it's still empty.
    const firstInput = <HTMLInputElement>this.querySelectorAll('[type=text]')[0];
    if (!firstInput.value.length) {
      firstInput.focus();
    }
  }

  /**
   * Renders HTML for input groups.
   */
  private render() {
    const userValuesTemplate = require('./user_values.pug');
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
    this.innerHTML = userValuesTemplate({fields: fields});
  }

  /**
   * Converts stored user-provided values to an array, then populates each input
   * element with its corresponding user value.
   */
  private populateInputs() {
    const storageItem = localStorage.getItem(STORAGE_ITEM);
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
      this.results.setAttribute(HIDDEN_ATTR, '');
      this.enableOptionsGroups(false);
    } else {
      const measurements = this.getMeasurements()
      const {bmr, tdee, tdeeMax} = this.getResults(measurements);
      localStorage.setItem(STORAGE_ITEM, JSON.stringify(measurements));
      this.showResults(bmr, tdee, tdeeMax);
      this.enableOptionsGroups(true);
    }   
  }

  /**
   * Returns user's age, height, sex, and weight from form inputs.
   */
  private getMeasurements(): UserMeasurements {
    const values = {};
    const formData = new FormData(this.form);
    for (const field of this.fields) {
      values[field] = formData.get(field);
    }

    return {
      activity: values['activity'] || '0',
      age: Number(values['age']),
      feet: Number(values['feet']),
      goal: values['goal'] || '0',
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

    // Get BMR and factors based on selected values, then TDEE and maximum TDEE
    // for zig-zag chart.
    const bmr = this.formulas.basalMetabolicRate({age, height, sex, weight});
    const activityLevel = ActivityLevel.find(level => activity === level.value);
    const goalLevel = WeightGoal.find(level => goal === level.value);

    const tdee = this.formulas.totalDailyEnergyExpenditure({
      activity: activityLevel!.factor!,
      bmr,
      goal: goalLevel!.factor!,
    });
    const tdeeMax = this.formulas.totalDailyEnergyExpenditure({
      activity: ActivityLevel[ActivityLevel.length - 1]!.factor!,
      bmr,
      goal: WeightGoal[0]!.factor!,
    });

    return {bmr, tdee, tdeeMax};
  }

  /**
   * Sets attributes on elements to make them update themselves.
   */
  private showResults(bmr: number, tdee: number, tdeeMax: number) {
    this.results.removeAttribute(HIDDEN_ATTR);
    this.results.setAttribute('value', tdee.toFixed());
    this.results.setAttribute('bmr', bmr.toFixed());
 
    const zigZag = document.querySelector('zig-zag');
    if (zigZag) {
      zigZag.setAttribute('tdee', tdee.toFixed());
      zigZag.setAttribute('max-tdee', tdeeMax.toFixed());
      zigZag.removeAttribute('hidden');
    }
  }

  /**
   * Toggles 'disabled' attribute on input groups and sets a 'tabindex' value
   * on their children's labels to enable/disable keyboard tabbing.
   */
  private enableOptionsGroups(enabled: boolean) {
    const tabindex = enabled ? '0' : '-1';

    for (const selector of DISABLED_ELEMENTS) {
      const group = this.querySelector(selector);

      if (enabled) {
        group!.removeAttribute(DISABLED_ATTR);
      } else {
        group!.setAttribute(DISABLED_ATTR, '');
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
