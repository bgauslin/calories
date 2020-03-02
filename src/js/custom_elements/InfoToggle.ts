const OPEN_ATTR: string = 'open';

class InfoToggle extends HTMLElement {
  private button_: HTMLButtonElement;

  constructor() {
    super();
    this.addEventListener('click', (e: Event) => this.handleClick_(e));
  }

  connectedCallback(): void {
    this.renderButton_();
    this.renderPanel_();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick_);
  }

  /**
   * Toggles an attribute when the button is clicked.
   */
  private handleClick_(e: Event): void {
    const target = <HTMLInputElement>e.target;
    if (target.classList.contains(`${this.className}__button`)) {
      if (this.hasAttribute(OPEN_ATTR)) {
        this.removeAttribute(OPEN_ATTR);
        this.renderIcon_('info');
      } else {
        this.setAttribute(OPEN_ATTR, '');
        this.renderIcon_('close');
      }
    }
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
      const content = await response.json();
      const copy = content.data.calories[0].copy;
      const html = `\
        <div class="info-panel">\
          <div class="info-panel__copy">${copy}</div>\
        </div>\
      `;
      this.innerHTML += html.replace(/\s\s/g, '');
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }

  /**
   * Renders a button for attribute toggling.
   */
  private renderButton_(): void {
    this.innerHTML = `<button class="${this.className}__button" aria-label="About this app"></button>`;
    this.button_ = this.querySelector('button');
    this.renderIcon_('info');
  }

  /**
   * Renders an icon inside the button.
   */
  private renderIcon_(iconName: string) {
    console.log('iconName', iconName);
    console.log(this.button_);

    const svgPath = new Map();
    svgPath.set('close', '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>');
    svgPath.set('info', '<path d="M12 0 C5.373 0 0 5.375 0 12 0 18.629 5.373 24 12 24 18.627 24 24 18.629 24 12 24 5.375 18.627 0 12 0 Z M12 5.323 C13.122 5.323 14.032 6.233 14.032 7.355 14.032 8.477 13.122 9.387 12 9.387 10.878 9.387 9.968 8.477 9.968 7.355 9.968 6.233 10.878 5.323 12 5.323 Z M14.71 17.613 C14.71 17.934 14.45 18.194 14.129 18.194 L9.871 18.194 C9.55 18.194 9.29 17.934 9.29 17.613 L9.29 16.452 C9.29 16.131 9.55 15.871 9.871 15.871 L10.452 15.871 10.452 12.774 9.871 12.774 C9.55 12.774 9.29 12.514 9.29 12.194 L9.29 11.032 C9.29 10.712 9.55 10.452 9.871 10.452 L12.968 10.452 C13.288 10.452 13.548 10.712 13.548 11.032 L13.548 15.871 14.129 15.871 C14.45 15.871 14.71 16.131 14.71 16.452 L14.71 17.613 Z"/>');

    const html = `\
      <svg class="${this.className}__icon ${this.className}__icon--${iconName}" viewbox="0 0 24 24">\
        ${svgPath.get(iconName)}\
      </svg>\
    `;

    this.button_.innerHTML = html.replace(/\s\s/g, '');
  }
}

export {InfoToggle};
