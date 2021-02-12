const DIVISOR: number = 11; // Primes work best
const INTERVAL_MS: number = 30;
const VALUE_ATTR: string = 'value';

/**
 * Custom element that incrementally (yet quickly) changes one numeric value
 * to another.
 */
class NumberTicker extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return [VALUE_ATTR];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this.update(oldValue, newValue);
  }

  update(oldValue: string, newValue: string) {
    const oldNumber = parseInt(oldValue, 10);
    const newNumber = parseInt(newValue, 10);

    if (oldNumber && newNumber) {
      let incrementNumber: number = oldNumber;
      const difference = newNumber - oldNumber;
      const increment = Math.floor(difference / DIVISOR);

      const interval = setInterval(() => {
        incrementNumber += increment;
        if (difference >= 0 && incrementNumber >= newNumber ||
            difference < 0 && incrementNumber <= newNumber) {
          incrementNumber = newNumber;
          clearInterval(interval);
        }
        this.textContent = String(incrementNumber);
      }, INTERVAL_MS);
    } else {
      this.textContent = newValue;
    }
  }
}

customElements.define('number-ticker', NumberTicker);
