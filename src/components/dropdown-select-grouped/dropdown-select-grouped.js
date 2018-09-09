/**
 * Created by Sergiu Ghenciu on 28/03/2018
 */

'use strict';

angular
  .module('components.dropdown-select-grouped', [
    'components.dropdown-select',
    'utils.misc',
  ])
  .directive('dropdownSelectGrouped', [
    'misc',
    function(_) {
      const reset = (scope, resetDown) => (visible, selected) => {
        if (visible) {
          scope.grouped.forEach((e, i) => {
            e.disabled = !_.collide(scope.map[i], visible);
          });
        }
        resetDown(selected);
      };

      const augment = (scope) => {
        scope.resetFactory = (fn) => {
          scope.resetDown = fn;
          if (scope.resetFactoryUp) {
            const rf = scope.resetFactoryUp();
            if (rf) {
              rf(reset(scope, fn));
            }
          }
        };

        scope.onCallback = (item) => {
          if (scope.callback) {
            const all = scope.selectAll && scope.selectAll.value;
            if (item.value === null || item.value === all) {
              scope.callback()(item.value);
              return;
            }
            // const selected = scope.map[item.value];
            // scope.items.filter((e, i) => selected.includes(i))
            scope.callback()(scope.map[item.value]);
          }
        };
      };

      const initItems = (scope) => {
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
          scope.grouped.push({label: e, value: i});
        });

        // const selected = scope.items.find((e) => e.selected);
        // if (selected) {
        //   scope.resetDown(selected);
        // }
      };

      const init = (scope) => {
        augment(scope);
        const clear = scope.$watch('items', (newVal) => {
          if (newVal) {
            initItems(scope);
            clear();
          }
        });
      };

      return {
        restrict: 'EA',
        scope: {
          selectAll: '=',
          className: '=',
          disabled: '=',
          text: '@',
          label: '@',
          items: '=',
          callback: '&?',
          ngModel: '=?',
          resetFactoryUp: '&?resetFactory',
          name: '=',
        },
        link: {
          pre: init,
        },
        template:
          '<dropdown-select select-all="selectAll" ' +
          'items="grouped" ' +
          'text="{{::text}}" ' +
          'label="{{::label}}" ' +
          'disabled="disabled" ' +
          'reset-factory="resetFactory" ' +
          'callback="onCallback"></dropdown-select>',
      };
    },
  ]);
