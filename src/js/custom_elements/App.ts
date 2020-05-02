import fastclick from 'fastclick';

/**
 * Custom element that updates the DOM and initializes site-wide features.
 */
class App extends HTMLElement {
  private hasSetup_: boolean;

  constructor() {
    super();
    window.addEventListener('resize', this.viewportHeight_);
  }

  connectedCallback(): void {
    if (!this.hasSetup_) {
      this.setupDom_();
      this.touchEnabled_();
      this.viewportHeight_();
      this.googleAnalytics_();
      this.hasSetup_ = true;
    }
  }

  disconnectedCallback(): void {
    window.removeEventListener('resize', this.viewportHeight_);
  }

  /**
   * Removes 'no JS' stuff from the DOM.
   */
  private setupDom_(): void {
    document.body.removeAttribute('no-js');
    document.querySelector('noscript').remove();
  }

  /**
   * Removes 'no-touch' attribute and adds fastclick if device is touch-enabled.
   */
  private touchEnabled_(): void {
    if ('ontouchstart' in window || (window as any).DocumentTouch) {
      document.body.removeAttribute('no-touch');
      fastclick['attach'](document.body);
    }
  }

  /**
   * Sets custom property for viewport height that updates 'vh' calculation due
   * to iOS Safari behavior where chrome appears and disappears when scrolling.
   */
  private viewportHeight_(): void {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
  }

  /**
   * Initializes Google Analytics tracking.
   */
  private googleAnalytics_(): void {
    if (process.env.NODE_ENV === 'production') {
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*(new Date() as any);a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      (window as any).ga('create', process.env.GA_ID, 'auto');
      (window as any).ga('send', 'pageview');
    }
  }
}

export {App};
