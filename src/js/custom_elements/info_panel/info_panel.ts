const ENDPOINT = 'https://gauslin.com/api/etc/calories.json';
const FOR_ATTR = 'for';
const PENDING_ATTR = 'pending';

/**
 * Custom element that populates itself with data fetched from a JSON endpoint.
 */
class InfoPanel extends HTMLElement {
  private target: HTMLElement;

  constructor() {
    super();
  }

  connectedCallback() {
    this.setup();
    this.renderPanel();
  }

  private setup() {
    const target = this.getAttribute(FOR_ATTR)!;
    this.target = document.getElementById(target)!;
    this.removeAttribute(FOR_ATTR);
    this.setAttribute('aria-labelledby', target);
    this.setAttribute('hidden', '');
  }

  private async renderPanel(): Promise<any> {
    try {
      const response = await fetch(ENDPOINT);
      const json = await response.json();

      const div = document.createElement('div');
      div.innerHTML = json.info;
      this.appendChild(div);
      this.target.removeAttribute(PENDING_ATTR);
    } catch (error) {
      console.warn('Currently unable to fetch data. :(');
      return;
    }
  }
}

customElements.define('info-panel', InfoPanel);
