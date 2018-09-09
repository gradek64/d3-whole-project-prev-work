/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular.module('components.footer', []).directive('appFooter', function() {
  const link = (scope, elm, attrs) => {};
  return {
    restrict: 'EA',
    scope: {
      opts: '=',
    },
    templateUrl: 'components/footer/footer.html',
    link: link,
  };
});
