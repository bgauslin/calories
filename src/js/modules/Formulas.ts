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

enum Formula {
  'hb' = 'Harris-Benedict',
  'km' = 'Katch-McArdle',
  'ms' = 'Mifflin-StJeor',
}

/** Daily zig-zag calorie needs modifiers per day of the week. */
const zigZagCalories = [1, .9, 1.1, 1, 1, .8, 1.2];

class Formulas {
  /**
   * Basal Metabolic Rate (BMR) formulas. To simplify things, all values are
   * converted to metric before being passed to this function.
   * https://www.freedieting.com/calorie-needs
   * https://en.wikipedia.org/wiki/Harris%E2%80%93Benedict_equation
   */ 
  public basalMetabolicRate(measurements: Measurements, formula: string = 'ms', bodyFatPercentage?: number): number {
    const {age, height, sex, weight} = measurements;
    let bmrCalc: number;
    let female: number;
    let male: number;

    switch(Formula[formula]) {
      case 'Harris-Benedict':
        female = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
        male = 66.5 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
        break;
      case 'Katch-McArdle':
        // TODO: Update this to metric formula (if it isn't already metric).
        bmrCalc = (21.6 * (weight - (bodyFatPercentage * weight))) + 370;
        female = bmrCalc;
        male = bmrCalc;
        break;
      case 'Mifflin-StJeor':
      default:
        bmrCalc = (10 * weight) + (6.25 * height) - (5 * age);
        female = bmrCalc - 161;
        male = bmrCalc + 5;
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
    return (activity * bmr * BMR_MULTIPLIER) - goal;
  }

  /**
   * Returns Imperial weight converted to metric weight.
   */
  public kg(pounds: number): number {
    return (pounds / 2.2);
  }

  /**
   * Returns Imperial height converted to metric height.
   */
  public cm(inches: number): number {
    return (inches * 2.54);
  }

  /**
   * Creates zig-zag calorie needs across 7 days where each day's needs differ
   * to prevent weight loss plateau.
   */
  public zigZag(tdc: number, selector: string) {
    const targetEl = document.querySelector(selector);
    let html = '';
    zigZagCalories.forEach((day, index) => {
      html += `\
        <tr>\
          <td>Day ${index + 1}</td>\
          <td>${(tdc * day).toFixed(0)}</td>\
        </tr>\
      `;
    });
    console.log(targetEl);
    targetEl.innerHTML = html.replace(/\s\s/g, '');
  }
}

export {Formulas};