const FOR_ATTR = 'for';
const PENDING_ATTR = 'pending';

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
   * Adds and removes attributes.
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
    const query = `
      query {
        entry(collection: "pages", slug: "calories") {
          ... on Entry_Pages_Pages {
            content
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

      // Parse data and render it, then let the target know this is ready.
      const json = await response.json();
      const div = document.createElement('div');
      div.innerHTML = json.data.entry.content;
      this.appendChild(div);
      this.target.removeAttribute(PENDING_ATTR);
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }
}

customElements.define('info-panel', InfoPanel);
