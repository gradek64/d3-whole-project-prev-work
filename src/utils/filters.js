/**
 * Created by Sergiu Ghenciu on 20/02/2018
 */

'use strict';

angular
  .module('utils.filters', ['utils.misc'])
  .filter('ucFirst', ['misc', (_) => _.ucFirst])
  .filter('sort', [
    'misc',
    (_) => (arr, key, reverse, isNumber) =>
      arr.sort(_.compareFactory(key, reverse, isNumber)),
  ]);
