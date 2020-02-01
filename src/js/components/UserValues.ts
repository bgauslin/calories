import {Calculator} from '../modules/Calculator';

interface InputAttributes {
  inputmode: string,
  label: string,
  max: number,
  min?: number,
  name: string,
  pattern: string,
  type: string,
}

const EMPTY_ATTR: string = 'empty';

const LOCAL_STORAGE: string = 'values';

const UserInputs: InputAttributes[] = [
  {
    inputmode: 'decimal',
    label: 'Weight',
    max: 300,
    name: 'weight',
    pattern: '[0-9]{0,3}[\\.]?[0-9]{1}',
    type: 'number',
  },
  {
    inputmode: 'decimal',
    label: 'Feet',
    max: 7,
    min: 3,
    name: 'feet',
    pattern: '[3-7]',
    type: 'number',
  },
  {
    inputmode: 'decimal',
    label: 'Inches',
    max: 11,
    min: 0,
    name: 'inches',
    pattern: '[0-9]{0,1}[0-1]{1}',
    type: 'number',
  },
  {
    inputmode: 'decimal',
    label: 'Age',
    max: 100,
    min: 1,
    name: 'age',
    pattern: '[0-9]+',
    type: 'number',
  }
];


// CSS classnames for DOM elements.
enum CssClass {
  RESULT = 'result',
  VALUES = 'values',
}

class UserValues extends HTMLElement {
  calculator_: Calculator;
  observer_: MutationObserver;
  resultEl_: HTMLElement;
  userValues_: string;
  valuesEl_: HTMLElement;

  constructor() {
    super();

    this.calculator_ = new Calculator();
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
    let valuesHtml = '';
    UserInputs.forEach((el, index) => {
      const autofocus = (index === 0) ? 'autofocus' : '';
      const min = el.min ? `min="${el.min}"` : '';
      const max = el.max ? `max="${el.max}"` : '';
      const pattern = el.pattern ? `pattern="${el.pattern}"` : '';

      const input = `\
        <li id="${el.name}" class="values__item">\
          <label for="${el.name}" class="values__label">${el.label}</label>\
          <input class="values__input" type="${el.type}" name="${el.name}" inputmode="${el.inputmode}" ${min} ${max} ${pattern} aria-label="${el.label}" required ${autofocus}>\
        </li>\
      `;
      valuesHtml += input;
    });

    const html = `\
      <ul class="${CssClass.LIST}">\
        ${valuesHtml}\
      </ul>\
      <div class="${CssClass.RESULT}"></div>\
    `;

    this.innerHTML = html.replace(/\s\s/g, '');

    this.valuesEl_ = this.querySelector(`.${CssClass.LIST}`);
    this.resultEl_ = this.querySelector(`.${CssClass.RESULT}`);

    if (this.userValues_) {
      this.populateInputs_();
      this.updateResult_();
    }
  }

  /**
   * Converts stored user-provided values to an array, then populates each input
   * element with its corresponding user value.
   */
  private populateInputs_(): void {
    const values = JSON.parse(this.userValues_);
    UserInputs.forEach((field) => {
      const inputEl = <HTMLInputElement>this.querySelector(`[name=${field.name}]`);
      inputEl.value = values[field.name];
    });
  }

  /**
   * Updates 'result' element after calculating all values.
   */
  private updateResult_(): void {
    // Collect all input values.
    const values = {};
    UserInputs.forEach((field) => {
      const el = <HTMLInputElement>this.querySelector(`[name=${field.name}]`);
      if (el.value) {
        values[field.name] = Number(el.value);
      }
    });

    // TODO: Update UI for 'sex' value.
    // Create new object for passing into calculator.
    const data = {
      age: values['age'],
      height: (values['feet'] * 12) + values['inches'],
      sex: 'male',
      weight: values['weight'],
    }

    const bmr = this.calculator_.basalMetabolicRate(data);
    const bmi = this.calculator_.bodyMassIndex(data);

    // TODO: Update UI for 'level' and 'loss' values.
    const goals = {
      bmr,
      level: 'Lightly active',
      loss: '2 lbs.',
    };
    const tdc = this.calculator_.totalDailyCalories(goals);

    const result = `
      ${goals.level} activity level<br>
      Lose ${goals.loss} per week<br>
      <br>
      <b>${tdc.toFixed(0)}</b> Total Daily Calories<br>
      <br>
      ${bmi.toFixed(1)} Body Mass Index<br>
      ${bmr.toFixed(0)} Basal Metabolic Rate<br>
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
