/**
 * !!! TBC as a sample !!!
 *
 * All the files below, together, make a Module (see.module)
 *
 * interpolate-filter.js
 * version-directive.js
 * version.js
 *
 * https://github.com/angular/angular-seed
 */

'use strict';

angular
  .module('components.version.interpolate-filter', [])
  .filter('interpolate', [
    'version',
    function(version) {
      return function(text) {
        return String(text).replace(/%VERSION%/gm, version);
      };
    },
  ]);
