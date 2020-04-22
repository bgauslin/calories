require('dotenv').config();

import {App} from './modules/App';
import {Counter} from './custom_elements/Counter';
import {Expandable} from './custom_elements/Expandable';
import {FancyMarker} from './custom_elements/FancyMarker';
import {InfoPanel} from './custom_elements/InfoPanel';
import {InfoToggle} from './custom_elements/InfoToggle';
import {UserValues} from './custom_elements/UserValues';
import {ZigZag} from './custom_elements/ZigZag';

// Import styles for injecting into the DOM.
import '../stylus/calories.styl';

// Define all custom elements.
const map = new Map();
map.set(Counter, 'results-counter');
map.set(Expandable, 'app-expandable');
map.set(FancyMarker, 'fancy-marker');
map.set(InfoPanel, 'info-panel');
map.set(InfoToggle, 'info-toggle');
map.set(UserValues, 'user-values');
map.set(ZigZag, 'zig-zag');
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
