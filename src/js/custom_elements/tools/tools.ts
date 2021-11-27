import fastclick from 'fastclick';

/**
 * Custom element that updates the DOM and initializes site-wide features.
 */
class Tools extends HTMLElement {
  private hasSetup: boolean;

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.hasSetup) {
      this.setupDom();
      this.touchEnabled();
      this.googleAnalytics();
      this.hasSetup = true;
    }
  }

  /**
   * Removes 'no JS' stuff from the DOM.
   */
  private setupDom() {
    document.body.removeAttribute('no-js');
    document.querySelector('noscript').remove();
  }

  /**
   * Removes 'no-touch' attribute and adds fastclick if device is touch-enabled.
   */
  private touchEnabled() {
    if ('ontouchstart' in window || (window as any).DocumentTouch) {
      document.body.removeAttribute('no-touch');
      fastclick['attach'](document.body);
    }
  }

  /**
   * Initializes Google Analytics tracking.
   */
  private googleAnalytics() {
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

customElements.define('x-tools', Tools);
