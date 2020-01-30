enum CustomProperty {
  OFFSET = '--sticky-offset',
  SHIFT = '--sticky-shift',
}

class ShiftyHeader extends HTMLElement {
  private height_: number;

  constructor() {
    super();
  }

  connectedCallback(): void {
    this.getHeight_();
    this.applyShift_();
    this.resize_();
  }

  private getHeight_(): void {
    this.height_ = this.offsetHeight;
  }

  private resize_(): void {
    window.addEventListener('resize', () => this.getHeight_());
  }

  private applyShift_(): void {
    let scrollChange: number;
    let shift: number = 0;
    let yScroll: number;
    let yScrollLast: number = 0;
  
    document.addEventListener('scroll', () => {
      // Get current scroll position.
      yScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      // Update shift value based on change in scroll position if it's within
      // height bounds.
      scrollChange = yScroll - yScrollLast;
      if (shift > 0 || shift < this.height_) {
        shift += scrollChange;
      }

      // Reset shift value if it exceeds height bounds.
      if (shift > this.height_) {
        shift = this.height_;
      } else if (shift < 0) {
        shift = 0;
      }

      // Set CSS values for related elements to reference.
      document.documentElement.style.setProperty(
        CustomProperty.OFFSET, `${(this.height_ - shift) / 16}rem`);
      document.documentElement.style.setProperty(
        CustomProperty.SHIFT, `-${shift / 16}rem`);

      // Update yScrollLast for determining scroll change on next tick.
      yScrollLast = (yScroll <= 0) ? 0 : yScroll;

    }, false);
  }
}

export {ShiftyHeader};
