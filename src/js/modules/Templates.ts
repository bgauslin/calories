import {InputNumber, InputRadio} from './Datasets';

interface OptionsGroupData {
  buttons: InputRadio[],
  disabled?: boolean,
  headingLabel: string,
  headingNote?: string,
  modifier: string,
  name: string,
}
/**
 * HTML templates for rendering text inputs, radio buttons, grouped inputs.
 */
class Templates {
  private baseClassName: string;

  constructor(baseClassName: string) {
    this.baseClassName = baseClassName;
  }

  /**
   * Returns all rendered markup for a group of radio buttons: heading, marker,
   * and radio buttons.
   */
  public optionsGroup(data: OptionsGroupData): string {
    const {modifier, name, buttons, disabled, headingLabel, headingNote} = data;
    const isDisabled = disabled ? ' disabled' : '';
    return `\
      <div class="${this.baseClassName}__group ${this.baseClassName}__group--${modifier}"${isDisabled}>\
        ${this.fieldHeading(modifier, headingLabel, headingNote)}\
        <fancy-marker>\
          <ul class="${this.baseClassName}__list ${this.baseClassName}__list--${modifier}">\
            ${this.radioButtons(name, buttons)}\
          </ul>\
        </fancy-marker>\
      </div>\
    `;
  }

  /**
   * Returns rendered heading for a field or group of fields.
   */
  private fieldHeading(modifier: string, label: string, note?: string): string {
    const fieldNote = note ? ` <span class="${this.baseClassName}__heading__note">${note}</span>` : '';
    return `<h4 class="${this.baseClassName}__heading ${this.baseClassName}__heading--${modifier}">${label}${fieldNote}</h4>`;
  }

  /**
   * Returns rendered input fields.
   */
  public numberInputs(inputs: InputNumber[]): string {
    let allHtml = '';

    inputs.forEach((input) => {
      const {id, inputmode, label, name, pattern} = input;
      const modifier = name;
      const html = `\
        <li class="${this.baseClassName}__item ${this.baseClassName}__item--${modifier}">\
          <label for="${id}" class="${this.baseClassName}__label ${this.baseClassName}__label--${modifier}">${label}</label>\
          <input \
            class="${this.baseClassName}__input ${this.baseClassName}__input--text ${this.baseClassName}__input--${modifier}" \
            type="text" \
            name="${name}" \
            id="${id}" \
            inputmode="${inputmode}" \
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
  private radioButtons(name: string, buttons: InputRadio[]): string {
    const modifier = name;
    let allHtml = '';

    buttons.forEach((button, index) => {
      const {id, label, value} = button;
      const checked = (index === 0) ? ' checked' : '';
      const html = `\
        <li class="${this.baseClassName}__item ${this.baseClassName}__item--${modifier}">\
          <label for="${id}" class="${this.baseClassName}__label ${this.baseClassName}__label--${modifier}" tabindex="0">\
            <input \
              class="${this.baseClassName}__input ${this.baseClassName}__input--radio ${this.baseClassName}__input--${modifier}" \
              type="radio" \
              name="${name}" \
              id="${id}" \
              value="${value}" \
              tabindex="-1"\
              ${checked}>\
              <span class="${this.baseClassName}__label__caption">${label}</span>\
          </label>\
        </li>\
      `;
      allHtml += html;
    });

    return allHtml;
  }
}

export {Templates};
