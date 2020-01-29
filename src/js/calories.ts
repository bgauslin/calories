require('dotenv').config();

import {Calculator} from './modules/Calculator';

// Import styles for injecting into the DOM.
import '../stylus/calories.styl';

// Initialize the app.
document.addEventListener('DOMContentLoaded', () => new Calculator().test());

// Register the Service Worker.
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js');
//   });
// }
