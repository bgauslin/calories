import fastclick from 'fastclick';

class Utils {
  /**
   * Initializes handy site-wide methods.
   */
  public init(): void {
    this.touchEnabled_();
    this.googleAnalytics_();
    this.setViewportHeight_();
    window.addEventListener('resize', () => this.setViewportHeight_());
  }

  /**
   * Initializes Google Analytics tracking.
   */
  private googleAnalytics_(): void {
    if (process.env.NODE_ENV === 'production') {
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*(<any>new Date());a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      (<any>window).ga('create', process.env.GA_ID, 'auto');
      (<any>window).ga('send', 'pageview');
    }
  }

  /**
   * Removes 'no-touch' attribute and adds fastclick if device is touch-enabled.
   */
  private touchEnabled_(): void {
    if ('ontouchstart' in window || (<any>window).DocumentTouch) {
      document.body.removeAttribute('no-touch');
      fastclick['attach'](document.body);
    }
  }

  /**
   * Sets custom property for viewport height that updates 'vh' calculation due
   * to iOS Safari behavior where chrome appears and disappears when scrolling.
   */
  private setViewportHeight_(): void {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
  }
}

export {Utils};
