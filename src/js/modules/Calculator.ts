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

const AGE: number = 48;
const HEIGHT: number = 70;
const WEIGHT: number = 174;
const SEX: string = 'male';

class Calculator {
  private age_: number;
  private height_: number;
  private sex_: string;
  private weight_: number;

  constructor() {
    this.age_ = AGE;
    this.height_ = HEIGHT;
    this.sex_ = SEX;
    this.weight_= WEIGHT;
  }

  /**
   * Basal Metabolic Rate
   * Harris-Benedict formula
   */
  private bmr_(sex: string, weight: number,  height: number, age: number): number {
      const male = 66 + (6.3 * weight) + (12.9 * height) - (6.8 * age);
      const female = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * age);
  
      return (s === 'male') ? male : female;
  }

  /**
   * TODO...
   */
  private restingMetabolicRate_(age: number, height: number, weight: number): number {
    const w = weight * 6.25;
    const h = height * 12.7;
    const a = (age * 6.76) + 66;
    return (w + h - a) * 1.1;
  }

  /**
   * TODO...
   */
  private bodyMassIndex_(height: number, weight: number): string {
    const result = (weight * 703) / (height ** 2);
    return result.toFixed(1);
  }

  private totalDailyCalories_(bmr: number, level: string, loss: string = null): number {
    const activity = ACTIVITY.find(item => item.label === level);
    const total = (bmr * activity.multiplier);
  
    if (loss) {
      const totalLoss = WEEKLY_LOSS.get(loss);
    }
  
    return loss ? (total - totalLoss) : total;
  }

  /**
   * TODO...
   */
  public test(): void {
    const rate = this.restingMetabolicRate_(this.age_, this.height_, this.weight_);

    const el = document.createElement('div');
    el.classList.add('results');
    document.body.appendChild(el);
    el.innerHTML = `
      ${this.weight_} lbs.<br>
      ${this.height_}" height<br>
      ${this.age_} years old<br>
      <br>
      BMI = ${this.bodyMassIndex_(this.height_, this.weight_)}<br>
      RMR = ${rate} calories<br>
    `;
  }
}

export {Calculator};