/* global require, module */

var Angular2App = require('angular-cli/lib/broccoli/angular2-app');

module.exports = function(defaults) {
  return new Angular2App(defaults, {
    vendorNpmFiles: [
      'systemjs/dist/system-polyfills.js',
      'systemjs/dist/system.src.js',
      'zone.js/dist/**/*.+(js|js.map)',
      'es6-shim/es6-shim.js',
      'reflect-metadata/**/*.+(js|js.map)',
      'rxjs/**/*.+(js|js.map)',
      '@angular/**/*.+(js|js.map)',
      'bootstrap/dist/**/*.+(js|css|woff|woff2|ttf)',
      'moment/moment.js',
      'ng2-bootstrap/**/*.+(js|js.map)',
      'ng2-file-upload/**/*.+(js|js.map)'
      // 'ckeditor/*.+(js|png|css)' // TODO: Check why this is not working.
    ]
  });
};
