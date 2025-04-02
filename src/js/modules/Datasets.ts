export interface InputRadio {
  factor?: number,
  id: string,
  label: string,
  value: string,
}

export const _ActivityLevel = [
  {value: 0, label: 'None', factor: 1},
  {value: 3, label: '3', factor: 1.1455},
  {value: 4, label: '4', factor: 1.1819},
  {value: 5, label: '5', factor: 1.2188},
  {value: 7, label: 'Daily', factor: 1.2916},
];

export const _Sex = [
  {value: 'male', label: 'Male'},
  {value: 'female', label: 'Female'},
];

export const _WeightGoal = [
  {value: 0, label: 'None', factor: 0},
  {value: 1, label: '½', factor: 250},    
  {value: 2, label: '1', factor: 500},
  {value: 3, label: '1½', factor: 750},
  {value: 4, label: '2', factor: 1000},
];

export const ActivityLevel: InputRadio[] = [
  {
    factor: 1,
    id: 'level-0',
    label: 'None',
    value: '0',
  },
  {
    factor: 1.1455,
    id: 'level-3',
    label: '3',
    value: '3',
  },
  {
    factor: 1.1819,
    id: 'level-4',
    label: '4',
    value: '4',
  },
  {
    factor: 1.2188,
    id: 'level-5',
    label: '5',
    value: '5',
  },
  {
    factor: 1.2916,
    id: 'level-7',
    label: 'Daily',
    value: '7',
  },
];

export const Sex: InputRadio[] = [
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

export const WeightGoal: InputRadio[] = [
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
