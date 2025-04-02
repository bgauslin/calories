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
const INCHES_TO_MM = 2.54;
const LBS_TO_KG = 2.2;

/**
 * Formulas for calculating Basal Metabolic Rate (BMR), Body Mass Index (BMI),
 * Total Daily Energy Expenditure (TDEE), and converting height and weight in
 * Imperial units to metric.
 */
export class Formulas {
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
   * Returns Total Daily Energy Expenditure (TDEE) based on BMR, activity
   * level, and weight loss goal.
   */
  public totalDailyEnergyExpenditure(userData: CalorieNeeds): number {
    const {activity, bmr, goal} = userData;
    return (activity * bmr * BMR_MULTIPLIER) - goal;
  }

  /**
   * Returns weight in Imperial units converted to weight in metric units.
   */
  public kg(pounds: number): number {
    return Math.round((pounds / LBS_TO_KG) * 10) / 10;
  }

  /**
   * Returns height in Imperial units converted to height in metric units.
   */
  public cm(feet: number, inches: number): number {
    return ((feet * 12) + inches) * INCHES_TO_MM;
  }
}
