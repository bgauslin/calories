import {Attribute} from '../modules/Constants';
import {ActivityLevel, Measurements, Sex, WeightGoal} from '../modules/Datasets';
import {Formulas} from '../modules/Formulas';
import {Templates} from '../modules/Templates';

const LOCAL_STORAGE: string = 'values';

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
  resultEl_: HTMLElement;
  storage_: string;
  templates_: Templates;

  constructor() {
    super();
    this.formulas_ = new Formulas();
    this.templates_ = new Templates();
    this.storage_ = localStorage.getItem(LOCAL_STORAGE);
    this.addEventListener('change', (e) => this.update_(e));
  }

  static get observedAttributes(): string[] {
    return [Attribute.FORMULA, Attribute.UNITS];
  }

  connectedCallback(): void {
    this.setup_();
  }

  attributeChangedCallback(): void {
    this.update_();
  }

  disconnectedCallback(): void {
    this.removeEventListener('change', null);
  }

  /**
   * Creates DOM elements and populates them if there are stored user values.
   */
  private setup_(): void {
    const html = `\
      <form class="${CssClass.BASE}__form">\
        ${this.templates_.radioButtonsGroup('sex', RadioButtonsGroup.SEX, Sex, false, 'Sex', null)}\
        <div class="${CssClass.BASE}__group ${CssClass.BASE}__group--measurements">\
          <ul class="${CssClass.BASE}__list ${CssClass.BASE}__list--measurements">\
            ${this.templates_.numberInputs(Measurements)}\
          </ul>\
        </div>\
        ${this.templates_.radioButtonsGroup('activity', RadioButtonsGroup.ACTIVITY, ActivityLevel, true, 'Exercise', 'times per week')}\
        ${this.templates_.radioButtonsGroup('goal', RadioButtonsGroup.GOAL, WeightGoal, true, 'Weight loss', 'lbs. per week')}\
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
    }

    // Trigger each fancy-marker to set its marker position and set the
    // result's visibility.
    this.updateFancyMarkers_();
    this.update_(null);

    // Add listeners to the text/number fields.
    this.handleInputFocus_();
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
   * Sets an attribute on each fancy-marker so that they auto-update on 
   * initial page load.
   */
  updateFancyMarkers_(): void {
    const markers = this.querySelectorAll('fancy-marker');
    markers.forEach((marker) => marker.setAttribute('init', ''));
  }

  /**
   * Updates 'result' element after getting all values and passing them into
   * the BMR, BMI, and TDC formulas.
   */
  private update_(e?: Event): void {
    const values = {};
    const formData = new FormData(this.formEl_);
    this.allFields_.forEach((name) => values[name] = formData.get(name));

    const measurements = {
      age: Number(values['age']),
      height: Number(values['feet'] * 12) + Number(values['inches']),
      sex: values['sex'],
      weight: Number(values['weight']),
    };

    // Get BMR and BMI based on measurements.
    const bmr = this.formulas_.basalMetabolicRate(measurements);
    // TODO: Display BMI after the result.
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
          this.resultEl_.setAttribute(Attribute.INCREMENT, '');
        } else {
          this.resultEl_.removeAttribute(Attribute.INCREMENT);
        }
      }
      // Show/enable fields.
      this.resultEl_.setAttribute(Attribute.VALUE, tdc.toFixed(0));
      this.resultEl_.removeAttribute(Attribute.HIDDEN);
      INACTIVE_ELEMENTS.forEach((selector) => {
        this.querySelector(selector).removeAttribute(Attribute.INACTIVE);
      });
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(values));
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
