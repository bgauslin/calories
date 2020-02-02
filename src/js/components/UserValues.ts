import {Formulas} from '../modules/Formulas';
import {ActivityLevel, InputNumber, Metrics, InputRadio, Sex, WeightGoal} from '../modules/Datasets';

const EMPTY_ATTR: string = 'empty';
const LOCAL_STORAGE: string = 'values';

// CSS classnames for DOM elements.
enum CssClass {
  RESULT = 'result',
  VALUES = 'values',
}

class UserValues extends HTMLElement {
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
        ${this.radioButtons_('sex', Sex)}
        ${this.numberInputs_(Metrics)}\
      </dl>\
      <dl class="${CssClass.VALUES}">\
        <dt>Activity Level</dt>
        ${this.radioButtons_('activity', ActivityLevel)}
      </dl>\
      <dl class="${CssClass.VALUES}">\
        <dt>Weight Goal</dt>
        ${this.radioButtons_('goal', WeightGoal)}\
      </dl>\
      <div class="${CssClass.RESULT}"></div>\
    `;

    this.innerHTML = html.replace(/\s\s/g, '');

    this.resultEl_ = this.querySelector(`.${CssClass.RESULT}`);
    this.valuesEl_ = this.querySelector(`.${CssClass.VALUES}`);

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
          <input class="values__input" type="number" name="${name}" inputmode="decimal" ${min} ${max} ${pattern} aria-label="${label}" required>\
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
          <input type="radio" name="${name}" value="${value}"${checked}>
            ${label}${desc}
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
    Metrics.forEach((field) => {
      const inputEl = <HTMLInputElement>this.querySelector(`[name=${field.name}]`);
      inputEl.value = values[field.name];
    });
  }

  /**
   * Updates 'result' element after calculating all values.
   */
  private updateResult_(): void {
    // Collect all text/number input values.
    const values = {};

    // TODO: refactor this loop to include radio button values.
    Metrics.forEach((field) => {
      const el = <HTMLInputElement>this.querySelector(`[name=${field.name}]`);
      if (el.value) {
        values[field.name] = Number(el.value);
      }
    });

    // TODO: Include these in the loop above.
    // Collect all radio button values.
    const activityEl = <HTMLInputElement>this.querySelector('[name=activity]');
    const goalEl = <HTMLInputElement>this.querySelector('[name=goal]');
    const sexEl = <HTMLInputElement>this.querySelector('[name=sex]');

    const activity = activityEl.value;
    const goal = goalEl.value;
    const sex = sexEl.value;

    values['activity'] = activity;
    values['goal'] = goal;
    values['sex'] = sex;

    // TODO: Update UI for 'sex' value.
    // Create new object for passing into calculator.
    const metrics = {
      age: values['age'],
      height: (values['feet'] * 12) + values['inches'],
      sex: values['sex'],
      weight: values['weight'],
    }

    const bmr = this.formulas_.basalMetabolicRate(metrics);

    const tdc = this.formulas_.totalDailyCalories({
      bmr,
      activity,
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
