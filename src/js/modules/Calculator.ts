interface Activity {
  description?: string,
  label: string,
  multiplier: number,
}

interface Stats {
  age: number,
  height: number,
  sex: string,
  weight: number,
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

class Calculator {
  /** Harris-Benedict formula. */
  public basalMetabolicRate(stats: Stats): number {
    const {age, height, sex, weight} = stats;
    const male = 66 + (6.3 * weight) + (12.9 * height) - (6.8 * age);
    const female = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * age);

    return (sex === 'male') ? male : female;
  }

  public bodyMassIndex(stats: Stats): string {
    const {height, weight} = stats;
    const result = (weight * 703) / (height ** 2);

    return result.toFixed(1);
  }

  public totalDailyCalories(bmr: number, level: string, loss: string = null): number {
    const activity = ACTIVITY.find(item => item.label === level);
    const total = (bmr * activity.multiplier);

    return loss ? (total - WEEKLY_LOSS.get(loss)) : total;
  }
}

export {Calculator};