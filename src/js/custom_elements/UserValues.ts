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

interface UserMetrics {
  bmr: number,
  tdee: number,
  tdeeMax: number,
}

const BASE_CLASSNAME: string = 'values';
const HIDDEN_ATTR: string = 'hidden';
const INACTIVE_ATTR: string = 'inactive';
const INCREMENT_ATTR: string = 'increment';
const LOCAL_STORAGE: string = 'values';
const RESULT_CLASSNAME: string = 'result';
const UNITS_ATTR: string = 'units';

const INACTIVE_ELEMENTS: string[] = [
  '.values__group--activity',
  '.values__group--goal',
];

enum RadioButtonsGroup {
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
  resultEl_: HTMLElement;
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
      this.update_(null);
    }
  }

  disconnectedCallback(): void {
    this.removeEventListener('change', this.update_);
    this.removeEventListener('keyup', this.handleKey_);
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
   * Creates DOM elements and populates them if there are stored user values.
   */
  private setup_(): void {
    // Place all fields in an array to simplify looping.
    const measurementFields = Measurements.map(field => field.name);
    this.allFields_ = [
      ...measurementFields,
      ...Object.values(RadioButtonsGroup),
    ];

    // Render HTML for input groups and result-counter.
    this.innerHTML = this.render_();

    // Create references to primary elements.
    this.formEl_ = this.querySelector('form');
    this.resultEl_ = this.querySelector(`.${RESULT_CLASSNAME}`);

    // If user data exists, update HTML on page load.
    if (this.storage_) {
      this.populateInputs_();
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
    this.update_(null);
  }

  /**
   * Renders HTML for all input groups and result-counter.
   */
  private render_(): string {
    const html = `\
      <form class="${BASE_CLASSNAME}__form">\
        ${this.templates_.radioButtonsGroup({
          buttons: Sex,
          headingLabel: 'Sex',
          modifier:  'sex',
          name: RadioButtonsGroup.SEX,
        })}\
        <div class="${BASE_CLASSNAME}__group ${BASE_CLASSNAME}__group--measurements">\
          <ul class="${BASE_CLASSNAME}__list ${BASE_CLASSNAME}__list--measurements">\
            ${this.templates_.numberInputs(Measurements)}\
          </ul>\
        </div>\
        ${this.templates_.radioButtonsGroup({
          buttons: ActivityLevel,
          headingLabel: 'Exercise',
          headingNote: 'times per week',
          inactive: true,
          modifier: 'activity',
          name: RadioButtonsGroup.ACTIVITY,
        })}\
        ${this.templates_.radioButtonsGroup({
          buttons: WeightGoal,
          headingLabel: 'Weight loss',
          headingNote: 'lbs. per week',
          inactive: true,
          modifier: 'goal',
          name: RadioButtonsGroup.GOAL,
        })}\
      </form>\
      <result-counter class="${RESULT_CLASSNAME}"></result-counter>\
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
   * Updates result-counter element after getting all values and passing them
   * into the BMR, BMI, and TDEE formulas.
   */
  private update_(event?: Event): void {
    if (this.querySelectorAll(':invalid').length === 0) {
      // Get user measurements and save them for subsequent visits.
      const measurements = this.getMeasurements_()
      const {bmr, tdee, tdeeMax} = this.getMetrics_(measurements);
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(measurements));

      // Show result-counter and enable input groups.
      this.showResult_(bmr, tdee, tdeeMax);
      this.makeGroupsActive_(true);

      // Make result-counter increment its value if a radio button was clicked.
      if (event) {
        const target = <HTMLInputElement>event.target;
        if (target && target.type === 'radio') {
          this.resultEl_.setAttribute(INCREMENT_ATTR, '');
        } else {
          this.resultEl_.removeAttribute(INCREMENT_ATTR);
        }
      }
    } else {
      // Hide result-counter and disable input groups.
      this.resultEl_.setAttribute(HIDDEN_ATTR, '');
      this.makeGroupsActive_(false);
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
  private getMetrics_(measurements: UserMeasurements): UserMetrics {
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
   * Sets attributes on result-counter and zig-zag elements so that they can
   * update themselves.
   */
  showResult_(bmr: number, tdee: number, tdeeMax: number) {
    this.resultEl_.removeAttribute(HIDDEN_ATTR);
    this.resultEl_.setAttribute('value', tdee.toFixed(0));
    this.resultEl_.setAttribute('bmr', bmr.toFixed(0));
 
    const zigZag = document.querySelector('zig-zag')
    zigZag.setAttribute('tdee', tdee.toFixed());
    zigZag.setAttribute('max-tdee', tdeeMax.toFixed());
  }

  /**
   * Toggles 'inactive' attribute on input groups and sets a 'tabindex' value
   * on their children's labels to enable/disable keyboard tabbing.
   */
  private makeGroupsActive_(show: boolean): void {
    const tabindex = show ? '0' : '-1';

    INACTIVE_ELEMENTS.forEach((selector) => {
      const group = this.querySelector(selector);

      if (show) {
        group.removeAttribute(INACTIVE_ATTR);
      } else {
        group.setAttribute(INACTIVE_ATTR, '');
      }

      [...group.querySelectorAll('label[tabindex]')].forEach((label) => {
        label.setAttribute('tabindex', tabindex);
      });
    });
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
        console.log(el.selectionStart);
      });
    });
  }
}

export {UserValues};
