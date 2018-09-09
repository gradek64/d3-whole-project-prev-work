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
  .module('components.version.version-directive', [])
  .directive('appVersion', [
    'version',
    function(version) {
      return function(scope, elm, attrs) {
        elm.text(version);
      };
    },
  ]);
