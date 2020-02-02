interface InputAttributes {
  inputmode: string,
  label: string,
  max: number,
  min?: number,
  name: string,
  pattern: string,
  type: string,
}

interface RadioButtonAttributes {
  description?: string,
  label: string,
  value: number|string,
}

const ActivityLevel: RadioButtonAttributes[] = [
  {
    description: 'No exercise',
    label: 'Sedentary',
    value: 1.2,
  },
  {
    description: 'Exercise 1-3 days a week',
    label: 'Lightly active',
    value: 1.375,
  },
  {
    description: 'Exercise 3-5 days a week',
    label: 'Moderately active',
    value: 1.55,
  },
  {
    description: 'Exercise 6-7 days a week',
    label: 'Very active',
    value: 1.725,
  },
];

const Sex: RadioButtonAttributes[] = [
  {
    label: 'Male',
    value: 'male',
  },
  {
    label: 'Female',
    value: 'female',
  },
];

// TODO: Rename this to something like 'Metrics'.
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

const WeightGoal: RadioButtonAttributes[] = [
  {
    label: 'Maintain weight',
    value: 0,
  },
  {
    label: 'Lose 1/2 lb. per week',
    value: 250,
  },
  {
    label: 'Lose 1 lb. per week',
    value: 500,
  },
  {
    label: 'Lose 1 1/2 lbs. per week',
    value: 750,
  },
  {
    label: 'Lose 2 lbs. per week',
    value: 1000,
  },
];

export {
  ActivityLevel,
  InputAttributes,
  RadioButtonAttributes,
  Sex,
  UserInputs,
  WeightGoal,
};
