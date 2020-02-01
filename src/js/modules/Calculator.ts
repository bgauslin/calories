import {ACTIVITY, WEEKLY_LOSS} from './Constants';

interface Stats {
  age: number,
  height: number,
  sex: string,
  weight: number,
}

interface Goal {
  bmr: number,
  level: string,
  loss?: string,
}

class Calculator {
  /** Harris-Benedict formula. */
  public basalMetabolicRate(stats: Stats): number {
    const {age, height, sex, weight} = stats;
    const male = 66 + (6.3 * weight) + (12.9 * height) - (6.8 * age);
    const female = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * age);

    return (sex === 'male') ? male : female;
  }

  public bodyMassIndex(stats: Stats): number {
    return (stats.weight * 703) / (stats.height ** 2);
  }

  public totalDailyCalories(goal: Goal): number {
    const {bmr, level, loss} = goal;
    const activity = ACTIVITY.find(item => item.label === level);
    const total = (bmr * activity.multiplier);

    return loss ? (total - WEEKLY_LOSS.get(loss)) : total;
  }
}

export {Calculator};