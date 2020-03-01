const OPEN_ATTR: string = 'open';

class InfoToggle extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (e: Event) => this.handleClick_(e));
  }

  connectedCallback(): void {
    this.renderButton_();
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
      } else {
        this.setAttribute(OPEN_ATTR, '');
      }
    }
  }

  /**
   * Renders a button for attribute toggling.
   */
  private renderButton_(): void {
    const html = `\
      <button class="${this.className}__button" aria-label="About this app">\
        <svg class="${this.className}__icon" viewbox="0 0 24 24">\
          <path d="M12 0 C5.373 0 0 5.375 0 12 0 18.629 5.373 24 12 24 18.627 24 24 18.629 24 12 24 5.375 18.627 0 12 0 Z M12 5.323 C13.122 5.323 14.032 6.233 14.032 7.355 14.032 8.477 13.122 9.387 12 9.387 10.878 9.387 9.968 8.477 9.968 7.355 9.968 6.233 10.878 5.323 12 5.323 Z M14.71 17.613 C14.71 17.934 14.45 18.194 14.129 18.194 L9.871 18.194 C9.55 18.194 9.29 17.934 9.29 17.613 L9.29 16.452 C9.29 16.131 9.55 15.871 9.871 15.871 L10.452 15.871 10.452 12.774 9.871 12.774 C9.55 12.774 9.29 12.514 9.29 12.194 L9.29 11.032 C9.29 10.712 9.55 10.452 9.871 10.452 L12.968 10.452 C13.288 10.452 13.548 10.712 13.548 11.032 L13.548 15.871 14.129 15.871 C14.45 15.871 14.71 16.131 14.71 16.452 L14.71 17.613 Z"/>\
        </svg>\
      </button>\
    `;
    this.innerHTML += html.replace(/\s\s/g, '');
  }
}

export {InfoToggle};
