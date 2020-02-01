interface Activity {
  description?: string,
  label: string,
  multiplier: number,
}

const ACTIVITY: Activity[] = [
  {
    description: null,
    label: 'Sedentary',
    multiplier: 1.2,
  },
  {
    description: '1-3 days/week',
    label: 'Lightly active',
    multiplier: 1.375,
  },
  {
    description: '3-5 days/week',
    label: 'Moderately active',
    multiplier: 1.55,
  },
  {
    description: '6-7 days a week',
    label: 'Very active',
    multiplier: 1.725,
  },
];

const WEEKLY_LOSS = new Map();
WEEKLY_LOSS.set('1/2 lb.', 250);
WEEKLY_LOSS.set('1 lb.', 500);
WEEKLY_LOSS.set('1 1/2 lbs.', 750);
WEEKLY_LOSS.set('2 lbs.', 1000);

enum Attribute {
  NO_TOUCH = 'no-touch',
  THEME = 'theme',
}

enum Theme {
  ALT = 'dark',
  DEFAULT = 'light',
}

export {ACTIVITY, Attribute, Theme, WEEKLY_LOSS};