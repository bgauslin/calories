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

const BMR_MULTIPLIER: number = 1.2;

class Formulas {
  /**
   * Mifflin St. Jeor Basal Metabolic Rate (BMR) equation.
   * All values are converted to metric before being passed in.
   * https://en.wikipedia.org/wiki/Basal_metabolic_rate
   */ 
  public basalMetabolicRate(measurements: Measurements): number {
    const {age, height, sex, weight} = measurements;
    const bmrCalc = (10 * weight) + (6.25 * height) - (5 * age);
    const female = bmrCalc - 161;
    const male = bmrCalc + 5;
    return (sex === 'female') ? female : male;
  }

  /**
   * Returns Body Mass Index (BMI) based on height and weight in Imperial units.
   * https://en.wikipedia.org/wiki/Body_mass_index
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
    return (activity * bmr * BMR_MULTIPLIER) - goal;
  }

  /**
   * Returns weight in Imperial units converted to metric.
   */
  public kg(pounds: number): number {
    return (pounds / 2.2);
  }

  /**
   * Returns height in Imperial units converted to metric.
   */
  public cm(inches: number): number {
    return (inches * 2.54);
  }
}

export {Formulas};