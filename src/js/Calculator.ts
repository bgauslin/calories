const AGE = 48;
const HEIGHT = 70;
const WEIGHT = 174;

class Calculator {
  private age_: number;
  private height_: number;
  private weight_: number;

  constructor() {
    this.age_ = AGE;
    this.height_ = HEIGHT;
    this.weight_= WEIGHT;
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