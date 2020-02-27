const DIVISOR: number = 11; // Primes work best
const INCREMENT_ATTR: string = 'increment';
const INTERVAL_MS: number = 30;
const VALUE_ATTR: string = 'value';

class Counter extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return [VALUE_ATTR];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    this.update_(oldValue, newValue);
  }

  /**
   * Increments the value from old to new if the 'increment' attribute flag
   * is set. Otherwise displays the new value without incrementing since it's
   * possible to get stuck in the setInterval() loop in some cases and
   * we don't want that.
   */
  update_(oldValue: string, newValue: string) {
    const oldNumber = parseInt(oldValue, 10);
    const newNumber = parseInt(newValue, 10);

    if (oldNumber && newNumber && this.hasAttribute(INCREMENT_ATTR)) {
      this.removeAttribute(INCREMENT_ATTR);
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
