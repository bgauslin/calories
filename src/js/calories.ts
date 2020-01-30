require('dotenv').config();

import {App} from './modules/App';
import {ShiftyHeader} from './components/ShiftyHeader';
import {Themifier} from './components/Themifier';
import {UserValues} from './components/UserValues';

// Import styles for injecting into the DOM.
import '../stylus/calories.styl';

// Define all custom elements.
const map = new Map();
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
