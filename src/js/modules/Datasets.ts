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
    description: 'Sedentary',
    factor: 1.2,
    id: 'level-0',
    label: 'None',
    value: '0',
  },
  {
    description: 'Lightly active',
    factor: 1.375,
    id: 'level-1',
    label: '1–3',
    value: '1',
  },
  {
    description: 'Moderately active',
    factor: 1.55,
    id: 'level-2',
    label: '3–5',
    value: '2',
  },
  {
    description: 'Highly active',
    factor: 1.725,
    id: 'level-3',
    label: '6–7',
    value: '3',
  },
];

const Metrics: InputNumber[] = [
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
    id: 'weight',
    label: 'Weight',
    max: 300,
    min: 0,
    name: 'weight',
    pattern: '[0-9]{0,3}[\\.]?[0-9]{1}',
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
    label: 'None',
    value: '0',
  },
  {
    factor: 250,
    id: 'goal-1',
    label: '½',
    value: '1',
  },
  {
    factor: 500,
    id: 'goal-2',
    label: '1',
    value: '2',
  },
  {
    factor: 750,
    id: 'goal-3',
    label: '1½',
    value: '3',
  },
  {
    factor: 1000,
    id: 'goal-4',
    label: '2',
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
