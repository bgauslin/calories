export interface InputRadio {
  factor?: number,
  label: string,
  labelImperial?: string,
  value: number|string,
}

export interface Measurements {
  age: number,
  activity: number,
  goal: number,
  height: number,
  sex: string,
  weight: number,
}

/**
 * Properties for activity level radio buttons.
 */
export const ActivityLevel: InputRadio[] = [
  {value: 0, label: 'None', factor: 1},
  {value: 3, label: '3', factor: 1.1455},
  {value: 4, label: '4', factor: 1.1819},
  {value: 5, label: '5', factor: 1.2188},
  {value: 7, label: 'Daily', factor: 1.2916},
];

/**
 * Properties for sex radio buttons.
 */
export const Sex: InputRadio[] = [
  {value: 'male', label: 'Male'},
  {value: 'female', label: 'Female'},
];

/**
 * Properties for weight goal radio buttons.
 */
export const WeightGoal: InputRadio[] = [
  {value: 0, label: 'None', factor: 0},
  {value: 1, label: '¼', labelImperial: '½', factor: 250},
  {value: 2, label: '½', labelImperial: '1', factor: 500},
  {value: 3, label: '¾', labelImperial: '1½', factor: 750},
  {value: 4, label: '1', labelImperial: '2', factor: 1000},
];

/**
 * Regex patterns for text input elements.
 * 10-99 yrs
 * 3'-0" - 7'-0" | 91-213 cm
 * 88-440 lbs | 40-200 kg (with decimal)
 */
export const pattern = {
  age: '[1-9][0-9]?',  
  height: {
    imperial: {
      feet: '[3-7]',
      inches: '[0-9]|1[01]',
    },
    metric: '9[1-9]|1[0-9]{2}|20[0-9]|21[0-3]',
  },
  weight: {
    imperial: '8[89][,\.]?[1-9]?|(9[0-9]|[1-3][0-9]{2}|4[0-3][0-9])[,\.]?[1-9]?|440',
    metric: '40[,\.]?[1-9]?|([5-9][0-9]|1[0-9]{2})[,\.]?[1-9]?|200',
  },
}
