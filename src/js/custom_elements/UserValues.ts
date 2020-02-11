import {Attribute} from '../modules/Constants';
import {ActivityLevel, InputNumber, InputRadio, Metrics, Sex, WeightGoal} from '../modules/Datasets';
import {Formulas} from '../modules/Formulas';

const LOCAL_STORAGE: string = 'values';

enum CssClass {
  BASE = 'values',
  RESULT = 'result',
}

enum FieldName {
  ACTIVITY = 'activity',
  GOAL = 'goal',
  SEX = 'sex',
}

const INVISIBLE_ELEMENTS: string[] = [
  '.result',
  '.values__group--activity',
  '.values__group--goal',
];

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
    this.addEventListener('change', (e) => this.updateResult_(e));
  }

  connectedCallback(): void {
    this.setup_();
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
        ${this.radioButtonsGroup_('sex', FieldName.SEX, Sex, false, 'Sex', null)}\
        <div class="${CssClass.BASE}__group ${CssClass.BASE}__group--metrics">\
          <ul class="${CssClass.BASE}__list ${CssClass.BASE}__list--metrics">\
            ${this.numberInputs_(Metrics)}\
          </ul>\
        </div>\
        ${this.radioButtonsGroup_('activity', FieldName.ACTIVITY, ActivityLevel, true, 'Exercise', 'times per week')}\
        ${this.radioButtonsGroup_('goal', FieldName.GOAL, WeightGoal, true, 'Weight loss', 'lbs. per week')}\
      </form>\

      <result-counter class="${CssClass.RESULT}"></result-counter>\
    `;
    this.innerHTML = html.replace(/\s\s/g, '');

    // Create references to primary elements.
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
    }

    // Trigger each fancy-marker to set its marker position and set the
    // result's visibility.
    this.updateFancyMarkers_();
    this.updateResult_(null);
  }

  /**
   * Returns all rendered markup for a group of radio buttons: heading, marker,
   * and radio buttons.
   */
  private radioButtonsGroup_(modifier: string, fieldName: string, buttons:InputRadio[], invisible: boolean, headingLabel: string, headingNote?: string): string {
    const isInvisible = invisible ? ' invisible' : '';
    return `\
      <div class="${CssClass.BASE}__group ${CssClass.BASE}__group--${modifier}"${isInvisible}>\
        ${this.fieldHeading_(modifier, headingLabel, headingNote)}\
        <fancy-marker>\
          <ul class="${CssClass.BASE}__list ${CssClass.BASE}__list--${modifier}">\
            ${this.radioButtons_(fieldName, buttons)}\
          </ul>\
        </fancy-marker>\
      </div>\
    `;
  }

  /**
   * Returns rendered heading for a field or group of fields.
   */
  private fieldHeading_(modifier: string, label: string, note?: string): string {
    const fieldNote = note ? ` <span class="${CssClass.BASE}__heading__note">${note}</span>` : '';
    return `<h4 class="${CssClass.BASE}__heading ${CssClass.BASE}__heading--${modifier}">${label}${fieldNote}</h4>`;
  }

  /**
   * Returns rendered input fields.
   */
  private numberInputs_(inputs: InputNumber[]): string {
    let allHtml = '';

    inputs.forEach((input) => {
      const {id, label, max, min, name, pattern} = input;
      const html = `\
        <li class="${CssClass.BASE}__item ${CssClass.BASE}__item--${name}">\
          <label for="${id}" class="${CssClass.BASE}__label ${CssClass.BASE}__label--${name}">${label}</label>\
          <input \
            class="values__input values__input--${name}" \
            name="${name}" \
            id="${id}" \
            type="number" \
            inputmode="decimal" \
            min="${min}" \
            max="${max}" \
            pattern="${pattern}" \
            aria-label="${label}" \
            required>\
        </li>\
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
      const {id, label, value} = button;
      const checked = (index === 0) ? ' checked' : '';
      const html = `\
        <li class="${CssClass.BASE}__item ${CssClass.BASE}__item--${name}">\
          <label for="${id}" class="${CssClass.BASE}__label ${CssClass.BASE}__label--${name}">\
            <input \
              class="values__input values__input--${name}" \
              type="radio" \
              name="${name}" \
              id="${id}" \
              value="${value}" \
              ${checked}>\
              <span class="values__label__caption">${label}</span>\
          </label>\
        </li>\
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
  private updateResult_(e?: Event): void {
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
    // TODO: Display BMI after the result.
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
      this.resultEl_.setAttribute(Attribute.VALUE, tdc.toFixed(0));
      INVISIBLE_ELEMENTS.forEach((selector) => {
        this.querySelector(selector).removeAttribute(Attribute.INVISIBLE);
      });
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(values));
    } else {
      INVISIBLE_ELEMENTS.forEach((selector) => {
        this.querySelector(selector).setAttribute(Attribute.INVISIBLE, '');
      });
    }
  }
}

export {UserValues};
