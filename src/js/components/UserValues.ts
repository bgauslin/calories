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
    type: 'text',
  },
  {
    inputmode: 'decimal',
    label: 'Age',
    max: 100,
    min: 1,
    name: 'periods',
    pattern: '[0-9]+',
    type: 'number',
  }
];

// CSS classnames for DOM elements.
enum CssClass {
  LIST = 'list',
  TOTAL = 'total',
}

class UserValues extends HTMLElement {
  calculator_: Calculator;
  listEl_: HTMLElement;
  observer_: MutationObserver;
  resultEl_: HTMLElement;
  userValues_: string;

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
    let listHtml = '';
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
      listHtml += input;
    });

    const html = `\
      <ul class="${CssClass.LIST}">\
        ${listHtml}\
      </ul>\
      <div class="${CssClass.TOTAL}"></div>\
    `;

    this.innerHTML = html.replace(/\s\s/g, '');

    this.listEl_ = this.querySelector(`.${CssClass.LIST}`);
    this.resultEl_ = this.querySelector(`.${CssClass.TOTAL}`);

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
    const values = {};
    UserInputs.forEach((field) => {
      const el = <HTMLInputElement>this.querySelector(`[name=${field.name}]`);
      if (el.value) {
        values[field.name] = Number(el.value);
      }
    });

    if (this.querySelectorAll(':invalid').length === 0) {
      // TODO:
      // this.resultEl_.textContent = result;
      this.resultEl_.removeAttribute(EMPTY_ATTR);
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(values));
    } else {
      this.resultEl_.setAttribute(EMPTY_ATTR, '');
    }
  }
}

export {UserValues};
