const READY_ATTR: string = 'ready';

class InfoPanel extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    this.renderPanel_();
  }

  /**
   * Fetches data from a GraphQL endpoint.
   */
  private async renderPanel_(): Promise<any> {
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
      const data = await response.json();
      const copy = data.data.calories[0].copy;
      const html = `<div class="${this.className}__copy">${copy}</div>`;
      this.innerHTML += html.replace(/\s\s/g, '');
      this.setAttribute(READY_ATTR, '');
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }
}

export {InfoPanel};
