/**
 * Created by Sergiu Ghenciu on 23/02/2018
 */

'use strict';

angular
  .module('components.multiple-grouped', [
    'components.multiple-select',
    'utils.misc',
  ])
  .directive('multipleGrouped', [
    'misc',
    function(misc) {
      const augment = (scope) => {
        scope.onCallback = (checked) => {
          if (scope.callback) {
            scope.callback()(
              checked.reduce((a, e) => a.concat(scope.map[e]), [])
            );
          }
        };
      };

      const preLink = (scope) => {
        augment(scope);

        scope.map = {};
        scope.grouped = [];

        const unique = {};

        scope.items.map((e) => e.label).forEach((e, i) => {
          if (!unique[e]) {
            unique[e] = [];
          }
          unique[e].push(i);
        });

        Object.keys(unique).forEach((e, i) => {
          scope.map[i] = unique[e];
          scope.grouped.push({label: e});
        });
      };

      /* eslint-disable */
      return {
        restrict: 'EA',
        scope: {
          filter: '=',
          noSelectAll: '=',
          label: '@',
          text: '@',
          items: '=',
          callback: '&?',
          ngModel: '=?',
          resetFactory: '&?'
        },
        link: {
          pre: preLink
        },
        template:
          '<multiple-select items="grouped" ' +
          'filter="filter" ' +
          'text="{{text}}" ' +
          'callback="onCallback"></multiple-select>'
      };
    }
  ]);
