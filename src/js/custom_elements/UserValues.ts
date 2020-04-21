import {ActivityLevel, Measurements, Sex, WeightGoal} from '../modules/Datasets';
import {Formulas} from '../modules/Formulas';
import {Templates} from '../modules/Templates';

interface UserMeasurements {
  activity: string,
  age: number,
  goal: string,
  height: number,
  sex: string,
  weight: number,
}

interface UserMetrics {
  bmr: number,
  tdee: number,
  tdeeMax: number,
}

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
    this.resultEl_ = this.querySelector(`.${CssClass.RESULT}`);

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
          this.resultEl_.setAttribute(Attribute.INCREMENT, '');
        } else {
          this.resultEl_.removeAttribute(Attribute.INCREMENT);
        }
      }
    } else {
      // Hide result-counter and disable input groups.
      this.resultEl_.setAttribute(Attribute.HIDDEN, '');
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

    return {
      activity: values['activity'],
      age: Number(values['age']),
      goal: values['goal'],
      height,
      sex: values['sex'],
      weight,
    }
  }

  /**
   * Returns user's BMR, TDEE, and max TDEE based on their measurements.
   */
  private getMetrics_(measurements: UserMeasurements): UserMetrics {
    // Get factors based on selected values.
    const activityLevel = ActivityLevel.find((level) => {
      return measurements['activity'] === level.value;
    });

    const bmr = this.formulas_.basalMetabolicRate(measurements);

    const goalLevel = WeightGoal.find((level) => {
      return measurements['goal'] === level.value;
    });

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
    this.resultEl_.removeAttribute(Attribute.HIDDEN);
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
        group.removeAttribute(Attribute.INACTIVE);
      } else {
        group.setAttribute(Attribute.INACTIVE, '');
      }

      [...group.querySelectorAll('label[tabindex]')].forEach((label) => {
        label.setAttribute('tabindex', tabindex);
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
}

export {UserValues};
