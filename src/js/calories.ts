require('dotenv').config();

import './custom_elements/info/info';
import './custom_elements/number_ticker/number_ticker';
import './custom_elements/radio_marker/radio_marker';
import './custom_elements/tools/tools';
import './custom_elements/user_values/user_values';
import './custom_elements/zigzag/zigzag';

import '../stylus/index.styl';

if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
}
