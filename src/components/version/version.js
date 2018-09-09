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
  .module('components.version', [
    'components.version.interpolate-filter',
    'components.version.version-directive',
  ])
  .value('version', '0.3.0');
