const READY_ATTR: string = 'ready';
const TARGET_ATTR: string = 'target';

/**
 * Custom element that populates itself with data fetched from a
 * GraphQL endpoint.
 */
export class InfoPanel extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    this.renderPanel();
  }

  /**
   * Fetches data from a GraphQL endpoint.
   */
  private async renderPanel(): Promise<any> {
    const endpoint = (process.env.NODE_ENV === 'production') ?
        process.env.GRAPHQL_PROD : process.env.GRAPHQL_DEV;
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
      // Parse data and render it as HTML.
      const data = await response.json();
      const copy = data.data.calories[0].copy;
      const html = `<div class="${this.className}__copy">${copy}</div>`;
      this.innerHTML += html.replace(/\s\s/g, '');

      // Let toggle know that the panel is ready.
      const targetEl = document.getElementById(this.getAttribute(TARGET_ATTR));
      targetEl.setAttribute(READY_ATTR, '');
      this.removeAttribute(TARGET_ATTR);

    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }
}
