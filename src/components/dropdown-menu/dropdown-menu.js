/**
 * Created by Sergiu Ghenciu on 18/12/2017
 */

'use strict';

angular
  .module('components.dropdown-menu', ['components.dropdown', 'utils.misc'])
  .directive('dropdownMenu', [
    'misc',
    function(_) {
      const preLink = (scope) => {
        scope.id = 'dm-' + _.randomStr(4);
        // scope.opts = JSON.parse(scope.opts);
      };

      /* eslint-disable */
      return {
        restrict: 'EA',
        scope: {
          // opts: '=',
          className: '@',
          alignment: '@',
          icon: '@',
          text: '@',
          items: '=',
          callback: '&'
        },
        link: {
          pre: preLink
        },
        template:
          '<a dropdown="{activates: id, alignment: alignment}" ng-class="className" class="dropdown-button waves-effect" href="#">' +
          '<i ng-if="icon" ng-class="{left: text}" class="material-icons">{{icon}}</i>' +
          '{{text}}' +
          '</a>' +
          '<ul id="{{id}}" class="dropdown-content menu">' +
          '<li ng-repeat="item in ::items track by $index" ng-class="{disabled: item.disabled}">' +
          '<a ng-click="callback()(item); $event.preventDefault();">{{item.label}}</a>' +
          '</li>' +
          '</ul>'
      };
    }
  ]);
