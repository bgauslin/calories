require('dotenv').config();

import {App} from './modules/App';
import {Counter} from './custom_elements/Counter';
import {FancyMarker} from './custom_elements/FancyMarker';
import {ShiftyHeader} from './custom_elements/ShiftyHeader';
import {UserValues} from './custom_elements/UserValues';

// Import styles for injecting into the DOM.
import '../stylus/calories.styl';

// Define all custom elements.
const map = new Map();
map.set(Counter, 'result-counter');
map.set(FancyMarker, 'fancy-marker');
map.set(ShiftyHeader, 'app-header');
map.set(UserValues, 'user-values');
map.forEach((key, value) => customElements.define(key, value));

// Initialize the app.
document.addEventListener('DOMContentLoaded', () => new App('2020').init());

// Register the Service Worker on production.
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
}
