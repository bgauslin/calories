interface Stats {
  age: number,
  height: number,
  sex: string,
  weight: number,
}

interface FinalResult {
  activity: string,
  bmr: number,
  goal: string,
}

class Calculator {
  /** Harris-Benedict formula. */
  public basalMetabolicRate(stats: Stats): number {
    const {age, height, sex, weight} = stats;
    const male = 66 + (6.3 * weight) + (12.9 * height) - (6.8 * age);
    const female = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * age);

    return (sex === 'male') ? male : female;
  }

  /** Returns Body Mass index based on height and weight. */
  public bodyMassIndex(stats: Stats): number {
    const {height, weight} = stats;
    return (weight * 703) / (height ** 2);
  }

  /**
   * Returns total daily calorie needs based on BMR, activity level, and
   * weight loss goal.
   */
  public totalDailyCalories(userData: FinalResult): number {
    const {bmr, activity, goal} = userData;
    return (bmr * Number(activity)) - Number(goal);
  }
}

export {Calculator};