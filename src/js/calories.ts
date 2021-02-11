require('dotenv').config();

// All custom elements.
import './custom_elements/app/app';
import './custom_elements/counter/counter';
import './custom_elements/expandable/expandable';
import './custom_elements/fancy_marker/fancy_marker';
import './custom_elements/info_panel/info_panel';
import './custom_elements/info_toggle/info_toggle';
import './custom_elements/user_values/user_values';
import './custom_elements/zigzag/zigzag';

// Import styles for injecting into the DOM.
import '../stylus/calories.styl';

// Register the Service Worker on production.
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
}
