class ShiftyHeader extends HTMLElement {
  private height_: number;
  private resizeListener_: any;
  private scrollChange_: number;
  private scrollListener_: any;
  private shift_: number;
  private yScroll_: number;
  private yScrollLast_: number;

  constructor() {
    super();
    this.shift_ = 0;
    this.yScrollLast_ = 0;

    // Listener references bound to custom element so that they're removed
    // when custom element is disconnected.
    this.resizeListener_ = this.getHeight_.bind(this);
    this.scrollListener_ = this.applyShift_.bind(this);
    window.addEventListener('resize', this.resizeListener_);
    document.addEventListener('scroll', this.scrollListener_);
  }

  connectedCallback(): void {
    this.getHeight_();
    this.applyShift_();
  }

  disconnectedCallback(): void {
    window.removeEventListener('resize', this.resizeListener_);
    document.removeEventListener('scroll', this.scrollListener_);
  }

  private getHeight_(): void {
    this.height_ = this.offsetHeight;
  }

  private applyShift_(): void {
    // Get current scroll position.
    this.yScroll_ = window.pageYOffset || document.documentElement.scrollTop;
    
    // Update shift value based on change in scroll position if it's within
    // height bounds.
    this.scrollChange_ = this.yScroll_ - this.yScrollLast_;
    if (this.shift_ > 0 || this.shift_ < this.height_) {
      this.shift_ += this.scrollChange_;
    }

    // Reset shift value if it exceeds height bounds.
    if (this.shift_ > this.height_) {
      this.shift_ = this.height_;
    } else if (this.shift_ < 0) {
      this.shift_ = 0;
    }

    // Set CSS values for related elements to reference.
    document.documentElement.style.setProperty('--sticky-shift', `-${this.shift_ / 16}rem`);

    // Update yScrollLast for determining scroll change on next tick.
    this.yScrollLast_ = (this.yScroll_ <= 0) ? 0 : this.yScroll_;
  }
}

export {ShiftyHeader};
