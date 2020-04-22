import {ActivityLevel, Measurements, Sex, WeightGoal} from '../modules/Datasets';
import {Formulas} from '../modules/Formulas';
import {Templates} from '../modules/Templates';

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

const BASE_CLASSNAME: string = 'values';
const DISABLED_ATTR: string = 'disabled';
const HIDDEN_ATTR: string = 'hidden';
const LOCAL_STORAGE: string = 'values';
const RESULT_CLASSNAME: string = 'results';
const UNITS_ATTR: string = 'units';

const DISABLED_ELEMENTS: string[] = [
  '.values__group--activity',
  '.values__group--goal',
];

enum OptionsGroup {
  ACTIVITY = 'activity',
  GOAL = 'goal',
  SEX = 'sex',
}

class UserValues extends HTMLElement {
  allFields_: string[];
  formEl_: HTMLFormElement;
  formulas_: Formulas;
  hasSetup_: boolean;
  keyListener_: any;
  resultsEl_: HTMLElement;
  storage_: string;
  templates_: Templates;

  constructor() {
    super();
    this.hasSetup_ = false;
    this.formulas_ = new Formulas();
    this.templates_ = new Templates();
    this.storage_ = localStorage.getItem(LOCAL_STORAGE);
    this.addEventListener('change', this.update_);
    this.addEventListener('keyup', this.handleKey_);
  }

  static get observedAttributes(): string[] {
    return [UNITS_ATTR];
  }

  connectedCallback(): void {
    this.setup_();
  }

  attributeChangedCallback(): void {
    if (this.hasSetup_) {
      this.update_();
    }
  }

  disconnectedCallback(): void {
    this.removeEventListener('change', this.update_);
    this.removeEventListener('keyup', this.handleKey_);
  }

  /**
   * Creates DOM elements and populates them if there are stored user values.
   */
  private setup_(): void {
    // Create array of all fields to simplify getting/setting things later.
    const measurementFields = Measurements.map(field => field.name);
    this.allFields_ = [
      ...measurementFields,
      ...Object.values(OptionsGroup),
    ];

    // Render HTML for input groups and results.
    this.innerHTML = this.render_();

    // Create references to primary elements.
    this.formEl_ = this.querySelector('form');
    this.resultsEl_ = this.querySelector(`.${RESULT_CLASSNAME}`);

    // If user data exists, update HTML on page load.
    if (this.storage_) {
      this.populateInputs_();
    }

    // Focus first text input if it's empty.
    const first = <HTMLInputElement>this.querySelector('[type=text]');
    if (!first.value.length) {
      first.focus();
    }

    // Set attribute on each fancy-marker which will trigger it to set its
    // marker position and the result element's visibility.
    [...this.querySelectorAll('fancy-marker')].forEach((marker) => {
      marker.setAttribute('init', '');
    });
    
    // Add focus/blur listeners to text inputs.
    this.handleInputFocus_();

    // All done.
    this.hasSetup_ = true;
    this.update_();
  }

  /**
   * Renders HTML for all input groups and results.
   */
  private render_(): string {
    const html = `\
      <form class="${BASE_CLASSNAME}__form">\
        ${this.templates_.optionsGroup({
          buttons: Sex,
          headingLabel: 'Sex',
          modifier:  'sex',
          name: OptionsGroup.SEX,
        })}\
        <div class="${BASE_CLASSNAME}__group ${BASE_CLASSNAME}__group--measurements">\
          <ul class="${BASE_CLASSNAME}__list ${BASE_CLASSNAME}__list--measurements">\
            ${this.templates_.numberInputs(Measurements)}\
          </ul>\
        </div>\
        ${this.templates_.optionsGroup({
          buttons: ActivityLevel,
          disabled: true,
          headingLabel: 'Exercise',
          headingNote: 'times per week',
          modifier: 'activity',
          name: OptionsGroup.ACTIVITY,
        })}\
        ${this.templates_.optionsGroup({
          buttons: WeightGoal,
          disabled: true,
          headingLabel: 'Weight loss',
          headingNote: 'lbs. per week',
          modifier: 'goal',
          name: OptionsGroup.GOAL,
        })}\
      </form>\
      <results-counter class="${RESULT_CLASSNAME}"></results-counter>\
    `;
    return html.replace(/\s\s/g, '');
  }

  /**
   * Converts stored user-provided values to an array, then populates each input
   * element with its corresponding user value.
   */
  private populateInputs_(): void {
    const stored = JSON.parse(this.storage_);
    this.allFields_.forEach((name) => {
      const inputEls = this.querySelectorAll(`[name=${name}]`);
      
      inputEls.forEach((el: HTMLInputElement) => {
        switch (el.type) {
          case 'number':
          case 'text':
            el.value = stored[name];
            break;
          case 'radio':
            el.checked = (el.value === stored[name]);
            break;
        }
      });
    });
  }

  /**
   * Updates results after getting all values and passing them into the BMR,
   * BMI, and TDEE formulas.
   */
  private update_(): void {
    if (this.querySelectorAll(':invalid').length) {
      // Hide results and disable input groups.
      this.resultsEl_.setAttribute(HIDDEN_ATTR, '');
      this.enableOptionsGroups_(false);
    } else {
      // Get user measurements and save them for subsequent visits.
      const measurements = this.getMeasurements_()
      const {bmr, tdee, tdeeMax} = this.getResults_(measurements);
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(measurements));

      // Show results and enable input groups.
      this.showResults_(bmr, tdee, tdeeMax);
      this.enableOptionsGroups_(true);
    }   
  }

  /**
   * Returns user's age, height, sex, and weight from form inputs.
   */
  private getMeasurements_(): UserMeasurements {
    const values = {};
    const formData = new FormData(this.formEl_);
    this.allFields_.forEach((name) => values[name] = formData.get(name));

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
  private getResults_(measurements: UserMeasurements): UserResults {
    let {activity, age, feet, goal, inches, sex, weight} = measurements;

    // Convert height and weight to metric for the formulas.
    const height = this.formulas_.cm((feet * 12) + inches);
    weight = this.formulas_.kg(weight);

    // Get BMR.
    const bmr = this.formulas_.basalMetabolicRate({age, height, sex, weight});

    // Get factors based on selected values for TDEE.
    const activityLevel = ActivityLevel.find(level => activity === level.value);
    const goalLevel = WeightGoal.find(level => goal === level.value);

    // Get Total Daily Energy Expenditure (TDEE).
    const tdee = this.formulas_.totalDailyEnergyExpenditure({
      activity: activityLevel.factor,
      bmr,
      goal: goalLevel.factor,
    });

    // Get maximum TDEE for zig-zag chart (maximum activity, no weight loss).
    const tdeeMax = this.formulas_.totalDailyEnergyExpenditure({
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
  showResults_(bmr: number, tdee: number, tdeeMax: number) {
    this.resultsEl_.removeAttribute(HIDDEN_ATTR);
    this.resultsEl_.setAttribute('value', tdee.toFixed(0));
    this.resultsEl_.setAttribute('bmr', bmr.toFixed(0));
 
    const zigZag = document.querySelector('zig-zag')
    zigZag.setAttribute('tdee', tdee.toFixed());
    zigZag.setAttribute('max-tdee', tdeeMax.toFixed());
  }

  /**
   * Toggles 'disabled' attribute on input groups and sets a 'tabindex' value
   * on their children's labels to enable/disable keyboard tabbing.
   */
  private enableOptionsGroups_(show: boolean): void {
    const tabindex = show ? '0' : '-1';

    DISABLED_ELEMENTS.forEach((selector) => {
      const group = this.querySelector(selector);

      if (show) {
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
  private handleKey_(e: KeyboardEvent): void {
    const target = <HTMLElement>e.target;
    const radio = target.querySelector('[type=radio]');
    if (radio && e.code === 'Enter') {
      target.click();
    }
  }

  /**
   * Places the cursor at the end of a text input field when it's focused.
   */
  private handleInputFocus_(): void {
    const names = Measurements.map(field => field.name);
    names.forEach((name) => {
      const el = <HTMLInputElement>this.querySelector(`[name=${name}]`);
      el.addEventListener('focus', () => {
        el.selectionStart = el.selectionEnd = el.value.length;
      });
    });
  }
}

export {UserValues};
