class ShiftyHeader extends HTMLElement {
  private height_: number;
  private scrollChange_: number;
  private shift_: number;
  private yScroll_: number;
  private yScrollLast_: number;

  constructor() {
    super();
    this.scrollChange_ = 0;
    this.shift_ = 0;
    this.yScroll_ = 0;
    this.yScrollLast_ = 0;
    window.addEventListener('resize', this.getHeight_);
    document.addEventListener('scroll', this.applyShift_);
  }

  connectedCallback(): void {
    this.getHeight_();
    this.applyShift_();
  }

  disconnectedCallback(): void {
    window.removeEventListener('resize', this.getHeight_);
    document.removeEventListener('scroll', this.applyShift_);
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

    // Set custom property for shifting the element vertically.
    this.style.setProperty('--shift-y', `-${this.shift_ / 16}rem`);

    // Update yScrollLast for determining scroll change on next tick.
    this.yScrollLast_ = (this.yScroll_ <= 0) ? 0 : this.yScroll_;
  }
}

export {ShiftyHeader};
