const OPEN_ATTR: string = 'open';

class InfoPanel extends HTMLElement {
  private content_: any;
  private observer_: MutationObserver;
  private triggerEl_: Element;

  constructor() {
    super();
    this.triggerEl_ = document.querySelector('info-toggle');
    this.observer_ = new MutationObserver(() => this.update_());
  }

  connectedCallback(): void {
    this.setup_();
    this.observer_.observe(this.triggerEl_, {attributes: true});
  }

  disconnectedCallback(): void {
    this.observer_.disconnect();
  }

  /**
   * Toggles an attribute to match the observed element's attribute.
   */
  private update_() {
    if (this.triggerEl_.hasAttribute(OPEN_ATTR)) {
      this.setAttribute(OPEN_ATTR, '');
    } else {
      this.removeAttribute(OPEN_ATTR);
    }
  }

  /**
   * Fetches data from a GraphQL endpoint.
   */
  private async setup_(): Promise<any> {
    const endpoint = (process.env.NODE_ENV === 'production') ? process.env.GRAPHQL_PROD : process.env.GRAPHQL_DEV;
    const query: string = `
      query {
        calories: entries(section: ["calories"], limit: 1) {
          ...on calories_calories_Entry {
            copy @markdown
          }
        }
      }
    `;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({query}),
      });
      const content = await response.json();
      const copy = content.data.calories[0].copy;
      this.innerHTML = `<div class="${this.className}__copy">${copy}</div>`;
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }
}

export {InfoPanel};
