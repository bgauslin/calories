interface CalorieNeeds {
  activity: number,
  bmr: number,
  goal: number,
}

interface Measurements {
  age: number,
  height: number,
  sex: string,
  weight: number,
}

enum Formula {
  'ms' = 'Mifflin-StJeor',
  'km' = 'Katch-McArdle',
  'hb' = 'Harris-Benedict',
}

class Formulas {
  /**
   * Basal Metabolic Rate (BMR) formulas per https://www.freedieting.com/calorie-needs
   */ 
  public basalMetabolicRate(measurements: Measurements, formula: string = 'ms', bodyFatPercentage?: number): number {
    const {age, height, sex, weight} = measurements;
    let bmrCalc: number;
    let female: number;
    let male: number;

    switch(Formula[formula]) {
      case 'Mifflin-StJeor':
        bmrCalc = (10 * this.kg_(weight)) + (6.25 * this.cm_(height)) - (5 * age);
        female = bmrCalc - 161;
        male = bmrCalc + 5;
        break;
      case 'Katch-McArdle':
        bmrCalc = (21.6 * (weight - (bodyFatPercentage * weight))) + 370;
        female = bmrCalc;
        male = bmrCalc;
        break;
      case 'Harris-Benedict':
        female = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * age);  
        male = 66 + (6.3 * weight) + (12.9 * height) - (6.8 * age);
        break;
    }

    return (sex === 'female') ? female : male;
  }

  /**
   * Returns Body Mass Index (BMI) based on height and weight in Imperial units.
   */
  public bodyMassIndex(measurements: Measurements): number {
    const {height, weight} = measurements;
    return (weight * 703) / (height ** 2);
  }

  /**
   * Returns total daily calorie needs based on BMR, activity level, and
   * weight loss goal.
   */
  public totalDailyCalories(userData: CalorieNeeds): number {
    const {activity, bmr, goal} = userData;
    return (activity * bmr) - goal;
  }

  /**
   * Returns Imperial weight converted to metric weight.
   */
  private kg_(pounds: number): number {
    return (pounds / 2.2);
  }

  /**
   * Returns Imperial height converted to metric height.
   */
  private cm_(inches: number): number {
    return (inches * 2.54);
  }
}

export {Formulas};