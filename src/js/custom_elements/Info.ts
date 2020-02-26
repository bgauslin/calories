const OPEN_ATTR: string = 'open';

class Info extends HTMLElement {
  private content_: any;

  constructor() {
    super();
    this.addEventListener('click', (e: Event) => this.handleClick_(e));
  }

  connectedCallback(): void {
    this.setup_();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick_);
  }

  /**
   * Renders all elements into the DOM.
   */
  private async setup_(): Promise<any> {
    this.renderButton_();
    this.content_ = await this.fetchData_();
    this.renderPanel_();
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
            heading
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
   * Toggles the panel open/closed if the button was clicked. If the menu is
   * open, the next click closes it.
   */
  private handleClick_(e: Event): void {
    const target = <HTMLInputElement>e.target;
    if (target.classList.contains(`${this.className}__toggle`)) {
      if (this.hasAttribute(OPEN_ATTR)) {
        this.removeAttribute(OPEN_ATTR);
      } else {
        this.setAttribute(OPEN_ATTR, '');
        window.requestAnimationFrame(() => {
          document.addEventListener('click', () => {
            this.removeAttribute(OPEN_ATTR);
          }, {once: true});
        });
      }
    }
  }

  /**
   * Renders a button that toggles the panel.
   */
  private renderButton_(): void {
    const html = `\
      <button class="${this.className}__toggle" aria-label="About this app">\
        <svg class="${this.className}__icon" viewbox="0 0 24 24">\
          <path d="M12 0 C5.373 0 0 5.375 0 12 0 18.629 5.373 24 12 24 18.627 24 24 18.629 24 12 24 5.375 18.627 0 12 0 Z M12 5.323 C13.122 5.323 14.032 6.233 14.032 7.355 14.032 8.477 13.122 9.387 12 9.387 10.878 9.387 9.968 8.477 9.968 7.355 9.968 6.233 10.878 5.323 12 5.323 Z M14.71 17.613 C14.71 17.934 14.45 18.194 14.129 18.194 L9.871 18.194 C9.55 18.194 9.29 17.934 9.29 17.613 L9.29 16.452 C9.29 16.131 9.55 15.871 9.871 15.871 L10.452 15.871 10.452 12.774 9.871 12.774 C9.55 12.774 9.29 12.514 9.29 12.194 L9.29 11.032 C9.29 10.712 9.55 10.452 9.871 10.452 L12.968 10.452 C13.288 10.452 13.548 10.712 13.548 11.032 L13.548 15.871 14.129 15.871 C14.45 15.871 14.71 16.131 14.71 16.452 L14.71 17.613 Z"/>\
        </svg>\
      </button>\
    `;
    this.innerHTML += html.replace(/\s\s/g, '');
  }

  /**
   * Renders fetched data into a panel.
   */
  private renderPanel_(): void {
    const {heading, summary, copy} = this.content_.data.calories[0];
    const html = `\
      <div class="${this.className}__panel">\
        <h2 class="${this.className}__heading">${heading}</h2>\
        <div class="${this.className}__summary">${summary}</div>\
        <div class="${this.className}__copy">\
          ${copy}\
        </div>\
      </div>\
    `;
    this.innerHTML += html.replace(/\s\s/g, '');
  }
}

export {Info};
