const DIVISOR: number = 11; // Prime number ensures variety with each increment.
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

  update_(oldValue: string, newValue: string) {
    const oldNumber = parseInt(oldValue, 10);
    const newNumber = parseInt(newValue, 10);

    if (oldNumber && newNumber) {
      let incrementNumber: number = oldNumber;
      const difference = newNumber - oldNumber;
      const increment = Math.floor(difference / DIVISOR);

      const interval = setInterval(() => {
        if ((difference <= 0 && (incrementNumber <= newNumber)) || (difference >= 0 && (incrementNumber >= newNumber))) {
          incrementNumber = newNumber;
          clearInterval(interval);
        } else {
          incrementNumber += increment;
        }
        this.textContent = incrementNumber.toString();
      }, INTERVAL_MS);
    } else {
      this.textContent = newValue;
    }
  }
}

export {Counter};
