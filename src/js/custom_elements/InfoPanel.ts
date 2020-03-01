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
    this.observer_.observe(this.triggerEl_, { attributes: true });
  }

  disconnectedCallback(): void {
    this.observer_.disconnect();
  }

  /**
   * Renders all elements into the DOM.
   */
  private async setup_(): Promise<any> {
    this.content_ = await this.fetchData_();
    this.renderPanel_();
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
  private async fetchData_(): Promise<any> {
    const endpoint = (process.env.NODE_ENV === 'production') ? process.env.GRAPHQL_PROD : process.env.GRAPHQL_DEV;
    const query: string = `
      query {
        calories: entries(section: ["calories"], limit: 1) {
          ...on calories_calories_Entry {
            summary
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
      return await response.json();
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }

  /**
   * Renders fetched data into a panel.
   */
  private renderPanel_(): void {
    const {summary, copy} = this.content_.data.calories[0];
    const html = `\      
      <div class="${this.className}__content">\
        <div class="${this.className}__summary">${summary}</div>\
        <div class="${this.className}__copy">\
          ${copy}\
        </div>\
      </div>\
    `;
    this.innerHTML += html.replace(/\s\s/g, '');
  }
}

export {InfoPanel};
