import {Formulas} from '../modules/Formulas';
import {ActivityLevel, InputNumber, InputRadio, Metrics, Sex, WeightGoal} from '../modules/Datasets';

const EMPTY_ATTR: string = 'empty';
const LOCAL_STORAGE: string = 'values';

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

    this.addEventListener('change', () => this.updateResult_());
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
      <form class="${CssClass.VALUES}__form">\
        ${this.radioButtonsGroup_('sex', FieldName.SEX, Sex, 'Sex', null)}\
        <div class="${CssClass.VALUES}__group ${CssClass.VALUES}__group--metrics">\
          <ul class="${CssClass.VALUES}__list ${CssClass.VALUES}__list--metrics">\
            ${this.numberInputs_(Metrics)}\
          </ul>\
        </div>\
        ${this.radioButtonsGroup_('activity', FieldName.ACTIVITY, ActivityLevel, 'Exercise', 'times per week')}\
        ${this.radioButtonsGroup_('goal', FieldName.GOAL, WeightGoal, 'Weight loss', 'lbs. per week')}\
      </form>\

      <result-counter class="${CssClass.RESULT}"></result-counter>\
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
    }

    // Trigger each fancy-marker to set its marker position and set the
    // result's visibility.
    this.updateFancyMarkers_();
    this.updateResult_();
  }

  /**
   * Returns all rendered markup for a group of radio buttons: heading, marker,
   * and radio buttons.
   */
  private radioButtonsGroup_(modifier: string, fieldName: string, buttons:InputRadio[], headingLabel: string, headingNote?: string): string {
    return `\
      <div class="${CssClass.VALUES}__group ${CssClass.VALUES}__group--${modifier}">\
        ${this.fieldHeading_(modifier, headingLabel, headingNote)}\
        <fancy-marker>\
          <ul class="${CssClass.VALUES}__list ${CssClass.VALUES}__list--${modifier}">\
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
    const fieldNote = note ? ` <span class="${CssClass.VALUES}__heading__note">${note}</span>` : '';
    return `<h4 class="${CssClass.VALUES}__heading ${CssClass.VALUES}__heading--${modifier}">${label}${fieldNote}</h4>`;
  }

  /**
   * Returns rendered input fields.
   */
  private numberInputs_(inputs: InputNumber[], tags: boolean = true): string {
    let allHtml = '';
    let startTag: string = ''
    let endTag: string = '';

    inputs.forEach((input) => {
      const {id, label, max, min, name, pattern} = input;
      if (tags) {
        startTag = `<li class="${CssClass.VALUES}__item ${CssClass.VALUES}__item--${name}">`;
        endTag = '</li>';
      }
      const html = `\
        ${startTag}\
          <label for="${id}" class="${CssClass.VALUES}__label ${CssClass.VALUES}__label--${name}">${label}</label>\
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
        ${endTag}\
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
      <li class="${CssClass.VALUES}__item ${CssClass.VALUES}__item--${name}">\
          <label for="${id}" class="${CssClass.VALUES}__label ${CssClass.VALUES}__label--${name}">\
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
      this.resultEl_.setAttribute('value', tdc.toFixed(0));
      this.resultEl_.removeAttribute(EMPTY_ATTR);
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(values));
    } else {
      this.resultEl_.setAttribute(EMPTY_ATTR, '');
    }
  }
}

export {UserValues};
