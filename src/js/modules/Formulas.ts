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

class Formulas {
  /**
   * Basal Metabolic Rate (BMR) formulas as found at
   * https://www.freedieting.com/calorie-needs
   **/ 
  public basalMetabolicRate(stats: Stats, formulaName: string = 'Mifflin-StJeor', bodyFatPercentage?: number): number {
    const {age, height, sex, weight} = stats;
    let formula: number;
    let male: number;
    let female: number;

    switch(formulaName) {
      case 'Mifflin-StJeor':
        formula = (10 * this.kg_(weight)) + (6.25 * this.cm_(height)) - (5 * age);
        male = formula + 5;
        female = formula - 161;
        break;
      case 'Katch-McArdle':
        formula = (21.6 * (weight - (bodyFatPercentage * weight))) + 370;
        male = formula;
        female = formula;
        break;
      case 'Harris-Benedict':
        male = 66 + (6.3 * weight) + (12.9 * height) - (6.8 * age);
        female = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * age);
        break;
    }

    return (sex === 'female') ? female : male;
  }

  /**
   * Returns Body Mass Index (BMI) based on height and weight in Imperial units.
   */
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

  /**
   * Returns Imperial weight converted to metric weight.
   */
  private kg_(pounds: number): number {
    return (pounds * 2.2);
  }

  /**
   * Returns Imperial height converted to metric height.
   */
  private cm_(inches: number): number {
    return (inches * 2.54);
  }
}

export {Formulas};