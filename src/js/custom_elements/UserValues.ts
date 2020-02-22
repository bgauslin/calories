import {ActivityLevel, Measurements, Sex, WeightGoal} from '../modules/Datasets';
import {Formulas} from '../modules/Formulas';
import {Templates} from '../modules/Templates';

const FORMULA_ATTR: string = 'formula';
const HIDDEN_ATTR: string = 'hidden';
const INACTIVE_ATTR: string = 'inactive';
const INCREMENT_ATTR: string = 'increment';
const LOCAL_STORAGE: string = 'values';
const UNITS_ATTR: string = 'units';

enum CssClass {
  BASE = 'values',
  RESULT = 'result',
}

enum RadioButtonsGroup {
  ACTIVITY = 'activity',
  GOAL = 'goal',
  SEX = 'sex',
}

const INACTIVE_ELEMENTS: string[] = [
  '.values__group--activity',
  '.values__group--goal',
];

class UserValues extends HTMLElement {
  allFields_: string[];
  formEl_: HTMLFormElement;
  formulas_: Formulas;
  hasSetup_: boolean;
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
  }

  static get observedAttributes(): string[] {
    return [FORMULA_ATTR, UNITS_ATTR];
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
  }

  /**
   * Creates DOM elements and populates them if there are stored user values.
   */
  private setup_(): void {
    const html = `\
      <form class="${CssClass.BASE}__form">\
        ${this.templates_.radioButtonsGroup({
          buttons: Sex,
          headingLabel: 'Sex',
          modifier:  'sex',
          name: RadioButtonsGroup.SEX,
        })}\
        <div class="${CssClass.BASE}__group ${CssClass.BASE}__group--measurements">\
          <ul class="${CssClass.BASE}__list ${CssClass.BASE}__list--measurements">\
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
      <result-counter class="${CssClass.RESULT}"></result-counter>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');

    // Create references to primary elements.
    this.formEl_ = this.querySelector('form');
    this.resultEl_ = this.querySelector(`.${CssClass.RESULT}`);

    // Place all fields in an array to simplify looping.
    const measurementFields = Measurements.map(field => field.name);
    this.allFields_ = [
      ...measurementFields,
      ...Object.values(RadioButtonsGroup),
    ];

    // Render user data on page load if it exists.
    if (this.storage_) {
      this.populateInputs_();
    } else {
      const firstInput = <HTMLInputElement>this.querySelectorAll('[type=number]')[0];
      firstInput.focus();
    }

    // Set attribute on each fancy-marker which will trigger it to set its
    // marker position (and the result's visibility).
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
   * Clears the input on focus and restores the previous value if the user
   * decides not to change it.
   */
  private handleInputFocus_(): void {
    const names = Measurements.map(field => field.name);
    names.forEach((name) => {
      let oldValue: string;
      const el = <HTMLInputElement>this.querySelector(`[name=${name}]`);

      // Save the old value on focus and clear the field.
      el.addEventListener('focus', () => {
        oldValue = el.value;
        el.value = '';
      });

      // Put the old value back if the value doesn't change.
      el.addEventListener('blur', () => {
        if (!el.value) {
          el.value = oldValue;
        }
      });
    })
  }

  /**
   * Updates 'result' element after getting all values and passing them into
   * the BMR, BMI, and TDC formulas.
   */
  private update_(e?: Event): void {
    const values = {};
    const formData = new FormData(this.formEl_);
    this.allFields_.forEach((name) => values[name] = formData.get(name));

    // Convert height and weight to metric regardless of user-selected units.
    let height: number;
    let weight: number = values['weight'];
    const units = this.getAttribute(UNITS_ATTR);

    // TODO: Add height/weight metric fields.
    switch (units) {
      case 'metric':
        height = values['cm'];
        break;
      case 'imperial':
        height = this.formulas_.cm(Number(values['feet'] * 12) + Number(values['inches']));
        weight = this.formulas_.kg(weight);
        break;
    }

    const measurements = {
      age: Number(values['age']),
      height,
      sex: values['sex'],
      weight,
    };

    // Get BMR based on measurements.
    const formula = this.getAttribute(FORMULA_ATTR) || '';
    const bmr = this.formulas_.basalMetabolicRate(measurements, formula);

    // TODO: Display BMI after the result.
    // Get BMI based on measurements.
    // const bmi = this.formulas_.bodyMassIndex(measurements);

    // Get factors based on selected values for calculating calorie needs.
    const activityLevel = ActivityLevel.find(level => values['activity'] === level.value);
    const goalLevel = WeightGoal.find(level => values['goal'] === level.value);
    const activity = activityLevel.factor;
    const goal = goalLevel.factor;

    // Get calorie needs.
    const tdc = this.formulas_.totalDailyCalories({
      activity,
      bmr,
      goal,
    });

    // Display all fields and save result when all required data is provided.
    if (this.querySelectorAll(':invalid').length === 0) {
      if (e) {
        const target = <HTMLInputElement>e.target;
        if (target && target.type === 'radio') {
          this.resultEl_.setAttribute(INCREMENT_ATTR, '');
        } else {
          this.resultEl_.removeAttribute(INCREMENT_ATTR);
        }
      }
      // Show/enable fields.
      this.resultEl_.setAttribute('value', tdc.toFixed(0));
      this.resultEl_.setAttribute('bmr', bmr.toFixed(0));
      this.resultEl_.removeAttribute(HIDDEN_ATTR);

      INACTIVE_ELEMENTS.forEach((selector) => {
        this.querySelector(selector).removeAttribute(INACTIVE_ATTR);
      });
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(values));

      // Show zig-zag values.
      document.querySelector('#zig-zag').setAttribute('tdc', tdc.toFixed());

    } else {
      // Hide/disable fields.
      this.resultEl_.setAttribute(HIDDEN_ATTR, '');
      INACTIVE_ELEMENTS.forEach((selector) => {
        this.querySelector(selector).setAttribute(INACTIVE_ATTR, '');
      });
    }
  }
}

export {UserValues};
