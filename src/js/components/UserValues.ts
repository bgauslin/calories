import {Formulas} from '../modules/Formulas';
import {ActivityLevel, InputNumber, InputRadio, Metrics, Sex, WeightGoal} from '../modules/Datasets';

const EMPTY_ATTR: string = 'empty';
const LOCAL_STORAGE: string = 'values';

// CSS classnames for DOM elements.
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
  allFieldNames_: string[];
  formulas_: Formulas;
  observer_: MutationObserver;
  resultEl_: HTMLElement;
  userValues_: string;
  valuesEl_: HTMLElement;

  constructor() {
    super();

    this.formulas_ = new Formulas();
    this.observer_ = new MutationObserver(() => this.updateResult_());
    this.userValues_ = localStorage.getItem(LOCAL_STORAGE);

    this.addEventListener('keyup', () => this.updateResult_());
    this.addEventListener('change', () => this.updateResult_());
  }

  connectedCallback(): void {
    this.setup_();
  }

  disconnectedCallback(): void {
    this.observer_.disconnect();
    this.removeEventListener('keyup', null);
  }

  /**
   * Creates DOM elements and populates them if there are stored user values.
   */
  private setup_(): void {
    const html = `\
      <dl class="${CssClass.VALUES}">\
        <dt>Metrics</dt>
        ${this.radioButtons_(FieldName.SEX, Sex)}
        ${this.numberInputs_(Metrics)}\
      </dl>\
      <dl class="${CssClass.VALUES}">\
        <dt>Activity Level</dt>
        ${this.radioButtons_(FieldName.ACTIVITY, ActivityLevel)}
      </dl>\
      <dl class="${CssClass.VALUES}">\
        <dt>Weight Goal</dt>
        ${this.radioButtons_(FieldName.GOAL, WeightGoal)}\
      </dl>\
      <div class="${CssClass.RESULT}"></div>\
    `;

    this.innerHTML = html.replace(/\s\s/g, '');

    this.resultEl_ = this.querySelector(`.${CssClass.RESULT}`);
    this.valuesEl_ = this.querySelector(`.${CssClass.VALUES}`);

    // Map all fields to new array to simplify subsequent loops.
    const metricsFieldNames = Metrics.map(field => field.name);
    this.allFieldNames_ = [
      ...metricsFieldNames,
      FieldName.ACTIVITY,
      FieldName.GOAL,
      FieldName.SEX,
    ];

    if (this.userValues_) {
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
      const {label, max, min, name, pattern} = input;
      const html = `\
        <dd id="${name}" class="values__item">\
          <label for="${name}" class="values__label">${label}</label>\
          <input \
            class="values__input" \
            name="${name}" \
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
      const {description, label, value} = button;
      const desc = description ? ` <span>(${description})</span>` : '';
      const checked = (index === 0) ? ' checked' : '';
      const html = `\
        <dd id="" class="values__item">\
          <label>
            <input \
              type="radio" \
              name="${name}" \
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
    const values = JSON.parse(this.userValues_);
    this.allFieldNames_.forEach((name) => {
      const inputEl = <HTMLInputElement>this.querySelector(`[name=${name}]`);
      switch (inputEl.type) {
        case 'number':
        case 'text':
          inputEl.value = values[name];
          break;
        case 'radio':
          inputEl.checked = true;
          break;
      }
    });
  }

  /**
   * Updates 'result' element after calculating all values.
   */
  private updateResult_(): void {
    // TODO: Use formData() here to collect all values.

    const values = {};
    this.allFieldNames_.forEach((name) => {
      const el = <HTMLInputElement>this.querySelector(`[name=${name}]`);
      if (el.value || el.checked) {
        values[name] = el.value;
      }
    });

    // Create new objects for passing into formulas.
    const metrics = {
      age: Number(values['age']),
      height: Number(values['feet'] * 12) + Number(values['inches']),
      sex: values['sex'],
      weight: Number(values['weight']),
    }

    const activity = values['activity'];
    const bmr = this.formulas_.basalMetabolicRate(metrics);
    const goal = values['goal'];

    const tdc = this.formulas_.totalDailyCalories({
      activity,
      bmr,
      goal,
    });

    const bmi = this.formulas_.bodyMassIndex(metrics);

    const result = `
      ${bmi.toFixed(1)} Body Mass Index<br>
      ${bmr.toFixed(0)} Basal Metabolic Rate<br>
      ${tdc.toFixed(0)} Total Daily Calories
    `;

    if (this.querySelectorAll(':invalid').length === 0) {
      this.resultEl_.innerHTML = result;
      this.resultEl_.removeAttribute(EMPTY_ATTR);
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(values));
    } else {
      this.resultEl_.setAttribute(EMPTY_ATTR, '');
    }
  }
}

export {UserValues};
