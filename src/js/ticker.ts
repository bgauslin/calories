/**
 * Custom element that incrementally changes one numeric value to another.
 */

customElements.define('calories-ticker', class NumberTicker extends HTMLElement {
  constructor() {
    super();
  }

  static observedAttributes: string[] = ['value'];

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this.update(oldValue, newValue);
  }

  private update(oldValue: string, newValue: string) {
    const oldNumber = parseInt(oldValue, 10);
    const newNumber = parseInt(newValue, 10);

    if (oldNumber && newNumber) {
      let incrementNumber: number = oldNumber;
      const difference = newNumber - oldNumber;
      const increment = Math.floor(difference / 11); // Primes work best.

      const interval = setInterval(() => {
        incrementNumber += increment;
        if (difference >= 0 && incrementNumber >= newNumber ||
            difference < 0 && incrementNumber <= newNumber) {
          incrementNumber = newNumber;
          clearInterval(interval);
        }
        this.textContent = `${incrementNumber}`;
      }, 30);
    } else {
      this.textContent = newValue;
    }
  }
});
