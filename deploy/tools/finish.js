'use strict';

const url = 'http://127.0.0.1:' + process.env.PORT + '/kill';
console.log("[test] Killing off server at %s", url);
require('request').post(url, () => console.log('[test] Killswitch triggered.'));