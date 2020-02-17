import {InputNumber, InputRadio} from './Datasets';

interface RadioButtonsGroupData {
  buttons: InputRadio[],
  headingLabel: string,
  headingNote?: string,
  inactive?: boolean,
  modifier: string,
  name: string,
}

enum CssClass {
  BASE = 'values',
  RESULT = 'result',
}

class Templates {
  /**
   * Returns all rendered markup for a group of radio buttons: heading, marker,
   * and radio buttons.
   */
  public radioButtonsGroup(data: RadioButtonsGroupData): string {
    const {modifier, name, buttons, inactive, headingLabel, headingNote} = data;
    const isInactive = inactive ? ' inactive' : '';
    return `\
      <div class="${CssClass.BASE}__group ${CssClass.BASE}__group--${modifier}"${isInactive}>\
        ${this.fieldHeading_(modifier, headingLabel, headingNote)}\
        <fancy-marker>\
          <ul class="${CssClass.BASE}__list ${CssClass.BASE}__list--${modifier}">\
            ${this.radioButtons_(name, buttons)}\
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
  public numberInputs(inputs: InputNumber[]): string {
    let allHtml = '';

    inputs.forEach((input) => {
      const {id, label, max, min, name, pattern, type} = input;
      const html = `\
        <li class="${CssClass.BASE}__item ${CssClass.BASE}__item--${name}">\
          <label for="${id}" class="${CssClass.BASE}__label ${CssClass.BASE}__label--${name}">${label}</label>\
          <input \
            class="values__input values__input--${name}" \
            type="${type}" \
            name="${name}" \
            id="${id}" \
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
}

export {Templates};
