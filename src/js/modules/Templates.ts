import {InputNumber, InputRadio} from './Datasets';

interface OptionsGroupData {
  buttons: InputRadio[],
  disabled?: boolean,
  headingLabel: string,
  headingNote?: string,
  modifier: string,
  name: string,
}

class Templates {
  private baseClassName_: string;

  constructor(baseClassName: string) {
    this.baseClassName_ = baseClassName;
  }

  /**
   * Returns all rendered markup for a group of radio buttons: heading, marker,
   * and radio buttons.
   */
  public optionsGroup(data: OptionsGroupData): string {
    const {modifier, name, buttons, disabled, headingLabel, headingNote} = data;
    const isDisabled = disabled ? ' disabled' : '';
    return `\
      <div class="${this.baseClassName_}__group ${this.baseClassName_}__group--${modifier}"${isDisabled}>\
        ${this.fieldHeading_(modifier, headingLabel, headingNote)}\
        <fancy-marker>\
          <ul class="${this.baseClassName_}__list ${this.baseClassName_}__list--${modifier}">\
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
    const fieldNote = note ? ` <span class="${this.baseClassName_}__heading__note">${note}</span>` : '';
    return `<h4 class="${this.baseClassName_}__heading ${this.baseClassName_}__heading--${modifier}">${label}${fieldNote}</h4>`;
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
        <li class="${this.baseClassName_}__item ${this.baseClassName_}__item--${modifier}">\
          <label for="${id}" class="${this.baseClassName_}__label ${this.baseClassName_}__label--${modifier}">${label}</label>\
          <input \
            class="${this.baseClassName_}__input ${this.baseClassName_}__input--text ${this.baseClassName_}__input--${modifier}" \
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
  private radioButtons_(name: string, buttons: InputRadio[]): string {
    const modifier = name;
    let allHtml = '';

    buttons.forEach((button, index) => {
      const {id, label, value} = button;
      const checked = (index === 0) ? ' checked' : '';
      const html = `\
        <li class="${this.baseClassName_}__item ${this.baseClassName_}__item--${modifier}">\
          <label for="${id}" class="${this.baseClassName_}__label ${this.baseClassName_}__label--${modifier}" tabindex="0">\
            <input \
              class="${this.baseClassName_}__input ${this.baseClassName_}__input--radio ${this.baseClassName_}__input--${modifier}" \
              type="radio" \
              name="${name}" \
              id="${id}" \
              value="${value}" \
              tabindex="-1"\
              ${checked}>\
              <span class="${this.baseClassName_}__label__caption">${label}</span>\
          </label>\
        </li>\
      `;
      allHtml += html;
    });

    return allHtml;
  }
}

export {Templates};
