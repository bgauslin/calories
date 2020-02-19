interface InputNumber {
  id: string,
  label: string,
  max: number,
  min: number,
  name: string,
  pattern: string,
  type: string,
}

interface InputRadio {
  factor?: number,
  id: string,
  label: string,
  value: string,
}

const ActivityLevel: InputRadio[] = [
  {
    factor: 1.2,
    id: 'level-0',
    label: 'None',
    value: '0',
  },
  {
    factor: 1.375, // 1.2 * 1.1455
    id: 'level-3',
    label: '3',
    value: '3',
  },
  {
    factor: 1.418, // 1.2 * 1.1819
    id: 'level-4',
    label: '4',
    value: '4',
  },
  {
    factor: 1.463, // 1.2 * 1.2188
    id: 'level-5',
    label: '5',
    value: '5',
  },
  {
    factor: 1.55, // 1.2 * 1.2916
    id: 'level-7',
    label: 'Daily',
    value: '7',
  },
];

const Measurements: InputNumber[] = [
  {
    id: 'feet',
    label: 'Ft.',
    max: 7,
    min: 3,
    name: 'feet',
    pattern: '[3-7]',
    type: 'number',
  },
  {
    id: 'inches',
    label: 'In.',
    max: 11,
    min: 0,
    name: 'inches',
    pattern: '[0-9]|1[01]',
    type: 'number',
  },
  {
    id: 'weight',
    label: 'Weight',
    max: 400,
    min: 10,
    name: 'weight',
    pattern: '[0-9]{0,3}[\\.]?[0-9]?',
    type: 'text',
  },
  {
    id: 'age',
    label: 'Age',
    max: 100,
    min: 1,
    name: 'age',
    pattern: '[1-9][0-9]?',
    type: 'number',
  },
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
    factor: 250, // TODO: 10%
    id: 'goal-1',
    label: '½',
    value: '1',
  },
  {
    factor: 500, // TODO: 20%
    id: 'goal-2',
    label: '1',
    value: '2',
  },
  {
    factor: 750, // TODO: 30%
    id: 'goal-3',
    label: '1½',
    value: '3',
  },
  {
    factor: 1000, // TODO: 40%
    id: 'goal-4',
    label: '2',
    value: '4',
  },
];

export {
  ActivityLevel,
  InputNumber,
  InputRadio,
  Measurements,
  Sex,
  WeightGoal,
};
