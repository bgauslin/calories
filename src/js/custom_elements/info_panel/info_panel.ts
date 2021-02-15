const FOR_ATTR: string = 'for';
const PENDING_ATTR: string = 'pending';

/**
 * Custom element that populates itself with data fetched from a
 * GraphQL endpoint.
 */
class InfoPanel extends HTMLElement {
  private target: Element;

  constructor() {
    super();
  }

  connectedCallback() {
    this.setup();
    this.renderPanel();
  }

  /**
   * Adds and removes attributes...
   */
  private setup() {
    const target = this.getAttribute(FOR_ATTR)
    this.target = document.getElementById(target);
    this.removeAttribute(FOR_ATTR);
    this.setAttribute('aria-labelledby', target);
    this.setAttribute('hidden', '');
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

      // Parse data and render it as HTML, then let the target know this
      // is ready.
      const data = await response.json();
      this.innerHTML += data.data.calories[0].copy;
      this.target.removeAttribute(PENDING_ATTR);

    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }
}

customElements.define('info-panel', InfoPanel);
