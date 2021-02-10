require('dotenv').config();

import {App} from './custom_elements/app/app';
import {Counter} from './custom_elements/counter/counter';
import {Expandable} from './custom_elements/expandable/expandable';
import {FancyMarker} from './custom_elements/fancy_marker/fancy_marker';
import {InfoPanel} from './custom_elements/info_panel/info_panel';
import {InfoToggle} from './custom_elements/info_toggle/info_toggle';
import {UserValues} from './custom_elements/user_values/user_values';
import {ZigZag} from './custom_elements/zigzag/zigzag';

// Import styles for injecting into the DOM.
import '../stylus/calories.styl';

// Define all custom elements.
const map = new Map();
map.set(App, 'calories-app');
map.set(Counter, 'results-counter');
map.set(Expandable, 'app-expandable');
map.set(FancyMarker, 'fancy-marker');
map.set(InfoPanel, 'info-panel');
map.set(InfoToggle, 'info-toggle');
map.set(UserValues, 'user-values');
map.set(ZigZag, 'zig-zag');
map.forEach((key, value) => customElements.define(key, value));

// Register the Service Worker on production.
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
}
