import {Formulas} from '../modules/Formulas';
import {ActivityLevel, InputNumber, InputRadio, Metrics, Sex, WeightGoal} from '../modules/Datasets';

const EMPTY_ATTR: string = 'empty';
const LOCAL_STORAGE: string = 'values';
const RESULT_LABEL: string = 'Total Daily Calories';

enum CssClass {
  RESULT = 'result',
  VALUES = 'values',
}

enum FieldName {
  ACTIVITY = 'activity',
  GOAL = 'goal',
  SEX = 'sex',
}

class UserValues extends HTMLElement {
  allFields_: string[];
  formEl_: HTMLFormElement;
  formulas_: Formulas;
  resultEl_: HTMLElement;
  storage_: string;

  constructor() {
    super();

    this.formulas_ = new Formulas();
    this.storage_ = localStorage.getItem(LOCAL_STORAGE);

    this.addEventListener('keyup', () => this.updateResult_());
    this.addEventListener('change', () => this.updateResult_());
  }

  connectedCallback(): void {
    this.setup_();
  }

  disconnectedCallback(): void {
    this.removeEventListener('keyup', null);
    this.removeEventListener('change', null);
  }

  /**
   * Creates DOM elements and populates them if there are stored user values.
   */
  private setup_(): void {
    const html = `\
      <form>\
        <dl class="${CssClass.VALUES} ${CssClass.VALUES}--metrics">\
          <dt class="${CssClass.VALUES}__heading">Metrics</dt>
          ${this.radioButtons_(FieldName.SEX, Sex)}
          ${this.numberInputs_(Metrics)}\
        </dl>\
        <dl class="${CssClass.VALUES} ${CssClass.VALUES}--activity">\
          <dt class="${CssClass.VALUES}__heading">Activity Level</dt>
          ${this.radioButtons_(FieldName.ACTIVITY, ActivityLevel)}
        </dl>\
        <dl class="${CssClass.VALUES} ${CssClass.VALUES}--loss">\
          <dt class="${CssClass.VALUES}__heading">Weekly weight loss</dt>
          ${this.radioButtons_(FieldName.GOAL, WeightGoal)}\
        </dl>\
        <div class="${CssClass.RESULT}"></div>\
      </form>\
    `;

    this.innerHTML = html.replace(/\s\s/g, '');

    this.formEl_ = this.querySelector('form');
    this.resultEl_ = this.querySelector(`.${CssClass.RESULT}`);

    // Place all fields in an array to simplify looping.
    const metricsFieldNames = Metrics.map(field => field.name);
    this.allFields_ = [
      ...metricsFieldNames,
      ...Object.values(FieldName),
    ];

    // Render user data on page load if it exists.
    if (this.storage_) {
      this.populateInputs_();
      this.updateResult_();
    }
  }

  /**
   * Returns rendered input fields.
   */
  private numberInputs_(inputs: InputNumber[]): string {
    let allHtml = '';
    inputs.forEach((input) => {
      const {id, label, max, min, name, pattern} = input;
      const html = `\
        <dd class="${CssClass.VALUES}__item ${CssClass.VALUES}__item--${name}">\
          <label for="${id}" class="${CssClass.VALUES}__label ${CssClass.VALUES}__label--${name}">${label}</label>\
          <input \
            class="values__input" \
            name="${name}" \
            id="${id}" \
            type="number" \
            inputmode="decimal" \
            min="${min}" \
            max="${max}" \
            pattern="${pattern}" \
            aria-label="${label}" \
            required>\
        </dd>\
      `;
      allHtml += html;
    });

    return allHtml;
  }

  /**
   * Returns rendered radio buttons.
   */
  private radioButtons_(name: string, buttons: InputRadio[]): string {
    let allHtml = '';
    buttons.forEach((button, index) => {
      const {description, id, label, value} = button;
      const desc = description ? ` <span class="${CssClass.VALUES}__label__description">(${description})</span>` : '';
      const checked = (index === 0) ? ' checked' : '';
      const html = `\
        <dd class="${CssClass.VALUES}__item ${CssClass.VALUES}__item--${name}">\
          <label for="${id}" class="${CssClass.VALUES}__label ${CssClass.VALUES}__label--${name}">\
            <input \
              type="radio" \
              name="${name}" \
              id="${id}" \
              value="${value}"${checked}> ${label}${desc}
          </label>\
        </dd>\
      `;
      allHtml += html;
    });

    return allHtml;
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
   * Updates 'result' element after getting all values and passing them into
   * the BMR, BMI, and TDC formulas.
   */
  private updateResult_(): void {
    const values = {};
    const formData = new FormData(this.formEl_);
    this.allFields_.forEach((name) => values[name] = formData.get(name));

    const metrics = {
      age: Number(values['age']),
      height: Number(values['feet'] * 12) + Number(values['inches']),
      sex: values['sex'],
      weight: Number(values['weight']),
    };

    // Get BMR and BMI based on metrics.
    const bmr = this.formulas_.basalMetabolicRate(metrics);
    // const bmi = this.formulas_.bodyMassIndex(metrics);

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

    // Display and save the result when all fields are filled in or selected.
    if (this.querySelectorAll(':invalid').length === 0) {
      this.resultEl_.innerHTML = `${tdc.toFixed(0)} ${RESULT_LABEL}`;
      this.resultEl_.removeAttribute(EMPTY_ATTR);
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(values));
    } else {
      this.resultEl_.setAttribute(EMPTY_ATTR, '');
    }
  }
}

export {UserValues};
