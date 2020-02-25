const query: string = `
  calories: entries(section: ["calories"], limit: 1) {
    ...on calories_calories_Entry {
      heading
      summary
      copy @markdown
    }
  }
}`;

class Info extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return [];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
  }
}

export {Info};
