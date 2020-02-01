interface Activity {
  description?: string,
  label: string,
  multiplier: number,
  value: number,
}

inteface WeeklyLoss {
  amount: number,
  label: string,
  value: number,
}

const ACTIVITY: Activity[] = [
  {
    description: null,
    label: 'Sedentary',
    multiplier: 1.2,
    value: 0,
  },
  {
    description: '1-3',
    label: 'Lightly active',
    multiplier: 1.375,
    value: 1,
  },
  {
    description: '3-5',
    label: 'Moderately active',
    multiplier: 1.55,
    value: 2,
  },
  {
    description: '6-7',
    label: 'Very active',
    multiplier: 1.725,
    value: 3,
  },
];

const WEEKLY_LOSS = new Map();
WEEKLY_LOSS.set('1/2 lb.', 250);
WEEKLY_LOSS.set('1 lb.', 500);
WEEKLY_LOSS.set('1 1/2 lbs.', 750);
WEEKLY_LOSS.set('2 lbs.', 1000);

const WEEKLY_LOSS_NEW: WeeklyLoss[] = [
  {
    amount: 250,
    label: '1/2 lb.',
    value: .5,
  },
  {
    amount: 500,
    label: '1 lb.',
    value: 1,
  },
  {
    amount: 750,
    label: '1 1/2 lbs.',
    value: 1.5,
  },
  {
    amount: 1000,
    label: '2 lbs.',
    value: 2,
  },
];

enum Attribute {
  NO_TOUCH = 'no-touch',
  THEME = 'theme',
}

enum Theme {
  ALT = 'dark',
  DEFAULT = 'light',
}

export {ACTIVITY, Attribute, Theme, WEEKLY_LOSS};