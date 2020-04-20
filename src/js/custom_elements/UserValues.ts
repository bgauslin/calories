import {ActivityLevel, Measurements, Sex, WeightGoal} from '../modules/Datasets';
import {Formulas} from '../modules/Formulas';
import {Templates} from '../modules/Templates';

const LOCAL_STORAGE: string = 'values';

enum Attribute {
  HIDDEN = 'hidden',
  INACTIVE = 'inactive',
  INCREMENT = 'increment',
  UNITS = 'units',
}

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
    return [Attribute.UNITS];
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

    // If user data exists, render it on page load.
    if (this.storage_) {
      this.populateInputs_();
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
   * the BMR, BMI, and TDEE formulas.
   */
  private update_(event?: Event): void {
    const values = {};
    const formData = new FormData(this.formEl_);
    this.allFields_.forEach((name) => values[name] = formData.get(name));

    // Convert height and weight to metric regardless of user-selected units.
    let height: number;
    let weight: number = values['weight'];
    const units = this.getAttribute(Attribute.UNITS);

    // TODO(#4): Height and weight fields in metric units.
    switch (units) {
      case 'metric':
        height = Number(values['cm']);
        weight = Number(values['kg']);
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
    const bmr = this.formulas_.basalMetabolicRate(measurements);

    // Get factors based on selected values for calculating calorie needs.
    const activityLevel = ActivityLevel.find(level => values['activity'] === level.value);
    const goalLevel = WeightGoal.find(level => values['goal'] === level.value);
    const activity = activityLevel.factor;
    const goal = goalLevel.factor;

    // Get Total Daily Energy Expenditure (TDEE).
    const tdee = this.formulas_.totalDailyEnergyExpenditure({
      activity,
      bmr,
      goal,
    });

    // Get maximum TDEE for zig-zag chart (maximum activity, no weight loss).
    const tdeeMax = this.formulas_.totalDailyEnergyExpenditure({
      activity: ActivityLevel[ActivityLevel.length - 1].factor,
      bmr,
      goal: WeightGoal[0].factor,
    });

    // Display all fields and save result when all required data is provided.
    if (this.querySelectorAll(':invalid').length === 0) {
      if (event) {
        const target = <HTMLInputElement>event.target;
        if (target && target.type === 'radio') {
          this.resultEl_.setAttribute(Attribute.INCREMENT, '');
        } else {
          this.resultEl_.removeAttribute(Attribute.INCREMENT);
        }
      }
      // Show/enable fields.
      this.resultEl_.setAttribute('value', tdee.toFixed(0));
      this.resultEl_.setAttribute('bmr', bmr.toFixed(0));
      this.resultEl_.removeAttribute(Attribute.HIDDEN);

      INACTIVE_ELEMENTS.forEach((selector) => {
        this.querySelector(selector).removeAttribute(Attribute.INACTIVE);
      });
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(values));

      // Set zig-zag attributes so it can update itself.
      const zigZag = document.querySelector('zig-zag')
      zigZag.setAttribute('tdee', tdee.toFixed());
      zigZag.setAttribute('max-tdee', tdeeMax.toFixed());

    } else {
      // Hide/disable fields.
      this.resultEl_.setAttribute(Attribute.HIDDEN, '');
      INACTIVE_ELEMENTS.forEach((selector) => {
        this.querySelector(selector).setAttribute(Attribute.INACTIVE, '');
      });
    }
  }
}

export {UserValues};
