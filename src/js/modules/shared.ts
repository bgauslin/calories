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
  imperial: boolean, 
}

export const ActivityLevel: InputRadio[] = [
  {value: 0, label: 'None', factor: 1},
  {value: 3, label: '3', factor: 1.1455},
  {value: 4, label: '4', factor: 1.1819},
  {value: 5, label: '5', factor: 1.2188},
  {value: 7, label: 'Daily', factor: 1.2916},
];

export const Sex: InputRadio[] = [
  {value: 'male', label: 'Male'},
  {value: 'female', label: 'Female'},
];

export const WeightGoal: InputRadio[] = [
  {value: 0, label: 'None', factor: 0},
  {value: 1, label: '¼', labelImperial: '½', factor: 250},
  {value: 2, label: '½', labelImperial: '1', factor: 500},
  {value: 3, label: '¾', labelImperial: '1½', factor: 750},
  {value: 4, label: '1', labelImperial: '2', factor: 1000},
];
