interface InputNumber {
  id: string,
  label: string,
  max: number,
  min: number,
  name: string,
  pattern: string,
}

interface InputRadio {
  description?: string,
  factor?: number,
  id: string,
  label: string,
  value: string,
}

const ActivityLevel: InputRadio[] = [
  {
    description: null,
    factor: 1.2,
    id: 'level-0',
    label: 'Sedentary',
    value: '0',
  },
  {
    description: '1-3 days a week',
    factor: 1.375,
    id: 'level-1',
    label: 'Light',
    value: '1',
  },
  {
    description: '3-5 days a week',
    factor: 1.55,
    id: 'level-2',
    label: 'Moderate',
    value: '2',
  },
  {
    description: '6-7 days a week',
    factor: 1.725,
    id: 'level-3',
    label: 'High',
    value: '3',
  },
];

const Metrics: InputNumber[] = [
  {
    id: 'weight',
    label: 'Weight',
    max: 300,
    min: 0,
    name: 'weight',
    pattern: '[0-9]{0,3}[\\.]?[0-9]{1}',
  },
  {
    id: 'feet',
    label: 'Feet',
    max: 7,
    min: 3,
    name: 'feet',
    pattern: '[3-7]',
  },
  {
    id: 'inches',
    label: 'Inches',
    max: 11,
    min: 0,
    name: 'inches',
    pattern: '[0-9]{0,1}[0-1]{1}',
  },
  {
    id: 'age',
    label: 'Age',
    max: 100,
    min: 1,
    name: 'age',
    pattern: '[0-9]+',
  }
];

const Sex: InputRadio[] = [
  {
    id: 'male',
    label: 'Male',
    value: 'male',
  },
  {
    id: 'female',
    label: 'Female',
    value: 'female',
  },
];

const WeightGoal: InputRadio[] = [
  {
    factor: 0,
    id: 'goal-0',
    label: 'Maintenance',
    value: '0',
  },
  {
    factor: 250,
    id: 'goal-1',
    label: '1/2 lb.',
    value: '1',
  },
  {
    factor: 500,
    id: 'goal-2',
    label: '1 lb.',
    value: '2',
  },
  {
    factor: 750,
    id: 'goal-3',
    label: '1 1/2 lbs.',
    value: '3',
  },
  {
    factor: 1000,
    id: 'goal-4',
    label: '2 lbs.',
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
