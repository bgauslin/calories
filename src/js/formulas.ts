interface CalorieNeeds {
  activity: number,
  bmr: number,
  goal: number,
}

interface ImperialHeight {
  feet: number,
  inches: number,
}

interface Measurements {
  age: number,
  height: number,
  sex: string,
  weight: number,
}

const BMR_MULTIPLIER: number = 1.2;
const INCHES_TO_CM = 2.54;
const LBS_TO_KG = 2.2;

/**
 * Formulas for calculating Basal Metabolic Rate (BMR), Body Mass Index (BMI),
 * Total Daily Energy Expenditure (TDEE), and converting height and weight in
 * Imperial units to metric (and vice versa).
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
   * Converts weight in Imperial units to metric.
   */
  public weightMetric(pounds: number): number {
    return Math.round((pounds / LBS_TO_KG) * 10) / 10;
  }

  /**
   * Converts weight in metric units to Imperial.
   */
  public weightImperial(kg: number): number {
    return Math.round((kg * LBS_TO_KG) * 10) / 10;
  }

  /**
   * Converts height in metric units to Imperial.
   */
  public heightImperial(cm: number): ImperialHeight {
    const total = Math.round(cm / INCHES_TO_CM);
    const feet = Math.floor(total / 12);
    const inches = total % 12;

    return {feet, inches};
  }

  /**
   * Converts height in Imperial units to metric.
   */
  public heightMetric(feet: number, inches: number): number {
    const result = ((feet * 12) + inches) * INCHES_TO_CM;
    return Math.round(result);
  }
}
