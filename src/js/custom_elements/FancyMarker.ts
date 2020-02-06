enum CustomProperty {
  LEFT = 'left',
  WIDTH = 'width',
}

class FancyMarker extends HTMLElement {
  private left_: number;
  private width_: number;
  private height_: number;
  private top_: number;
  private marker_: HTMLElement;

  constructor() {
    super();
  }

  connectedCallback(): void {
    this.renderMarker_();
    this.update_();
    this.addEventListener('change', (e) => this.update_());
  }

  private renderMarker_(): void {
    const marker = document.createElement('div');
    marker.classList.add('marker');
    this.appendChild(marker);

    this.marker_ = this.querySelector('.marker');
  }

  private update_(): void {
    const checked = this.querySelector(':checked');
    const parent = <HTMLElement>checked.parentNode;

    const rect = parent.getBoundingClientRect();

    this.left_ = rect.left;
    this.top_ = rect.top;
    this.width_ = parent.offsetWidth;
    this.height_ = parent.offsetHeight;

    this.marker_.style.height = `${this.height_ / 16}rem`;
    this.marker_.style.top = `${this.top_ / 16}rem`;

    this.style.setProperty(
      `--marker-${CustomProperty.LEFT}`, `${this.left_ / 16}rem`);
    this.style.setProperty(
      `--marker-${CustomProperty.WIDTH}`, `${this.width_ / 16}rem`);

  }
}

export {FancyMarker};
