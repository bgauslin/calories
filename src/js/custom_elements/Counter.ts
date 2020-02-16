import {Attribute} from '../modules/Constants';

const DIVISOR: number = 11; // Prime number ensures variety with each increment.
const INTERVAL_MS: number = 30;

class Counter extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return [Attribute.VALUE];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    this.update_(oldValue, newValue);
  }

  /**
   * Increments the result when user changes radio buttons. If user changes
   * number inputs, just display the result without incrementing since it's
   * possible to get stuck in the setInterval() process and we don't want that.
   */
  update_(oldValue: string, newValue: string) {
    const oldNumber = parseInt(oldValue, 10);
    const newNumber = parseInt(newValue, 10);

    if (oldNumber && newNumber && this.hasAttribute(Attribute.INCREMENT)) {
      this.removeAttribute(Attribute.INCREMENT);
      let incrementNumber: number = oldNumber;
      const difference = newNumber - oldNumber;
      const increment = Math.floor(difference / DIVISOR);

      const interval = setInterval(() => {
        incrementNumber += increment;
        if (difference >= 0 && incrementNumber >= newNumber || difference < 0 && incrementNumber <= newNumber) {
          incrementNumber = newNumber;
          clearInterval(interval);
        }
        this.textContent = incrementNumber.toString();
      }, INTERVAL_MS);
    } else {
      this.textContent = newValue;
    }
  }
}

export {Counter};
