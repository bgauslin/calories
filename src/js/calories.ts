require('dotenv').config();

import {App} from './modules/App';
import {Counter} from './custom_elements/Counter';
import {FancyMarker} from './custom_elements/FancyMarker';
import {ShiftyHeader} from './custom_elements/ShiftyHeader';
import {Themifier} from './custom_elements/Themifier';
import {UserValues} from './custom_elements/UserValues';

// Import styles for injecting into the DOM.
import '../stylus/calories.styl';

// Define all custom elements.
const map = new Map();
map.set(Counter, 'result-counter');
map.set(FancyMarker, 'fancy-marker');
map.set(ShiftyHeader, 'app-header');
map.set(Themifier, 'app-theme');
map.set(UserValues, 'user-values');
map.forEach((key, value) => customElements.define(key, value));

// Initialize the app.
document.addEventListener('DOMContentLoaded', () => new App('2019').init());

// Register the Service Worker.
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js');
//   });
// }
