interface InputNumber {
  label: string,
  max: number,
  min: number,
  name: string,
  pattern: string,
}

interface InputRadio {
  description?: string,
  factor?: number,
  label: string,
  value: string,
}

const ActivityLevel: InputRadio[] = [
  {
    description: 'No exercise',
    factor: 1.2,
    label: 'Sedentary',
    value: '0',
  },
  {
    description: 'Exercise 1-3 days a week',
    factor: 1.375,
    label: 'Lightly active',
    value: '1',
  },
  {
    description: 'Exercise 3-5 days a week',
    factor: 1.55,
    label: 'Moderately active',
    value: '2',
  },
  {
    description: 'Exercise 6-7 days a week',
    factor: 1.725,
    label: 'Very active',
    value: '3',
  },
];

const Metrics: InputNumber[] = [
  {
    label: 'Weight',
    max: 300,
    min: 0,
    name: 'weight',
    pattern: '[0-9]{0,3}[\\.]?[0-9]{1}',
  },
  {
    label: 'Feet',
    max: 7,
    min: 3,
    name: 'feet',
    pattern: '[3-7]',
  },
  {
    label: 'Inches',
    max: 11,
    min: 0,
    name: 'inches',
    pattern: '[0-9]{0,1}[0-1]{1}',
  },
  {
    label: 'Age',
    max: 100,
    min: 1,
    name: 'age',
    pattern: '[0-9]+',
  }
];

const Sex: InputRadio[] = [
  {
    label: 'Male',
    value: 'male',
  },
  {
    label: 'Female',
    value: 'female',
  },
];

const WeightGoal: InputRadio[] = [
  {
    factor: 0,
    label: 'Maintain weight',
    value: '0',
  },
  {
    factor: 250,
    label: 'Lose 1/2 lb. per week',
    value: '1',
  },
  {
    factor: 500,
    label: 'Lose 1 lb. per week',
    value: '2',
  },
  {
    factor: 750,
    label: 'Lose 1 1/2 lbs. per week',
    value: '3',
  },
  {
    factor: 1000,
    label: 'Lose 2 lbs. per week',
    value: '4',
  },
];

export {
  ActivityLevel,
  InputNumber,
  InputRadio,
  Metrics,
  Sex,
  WeightGoal,
};
