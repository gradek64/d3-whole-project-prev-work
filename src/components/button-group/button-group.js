/**
 * Created by Sergiu Ghenciu on 30/04/2018
 */

'use strict';

angular
  .module('components.button-group', ['utils.misc'])
  .directive('buttonGroup', [
    'misc',
    function(_) {
      const getSelected = (items) => items.filter((e) => e.selected);

      const radio = (scope, index, cb) => {
        scope.items.forEach((e) => {
          if (!e.disabled && e.selected) {
            e.selected = false;
          }
        });

        scope.items[index].selected = true;

        cb();
      };

      const slider = (scope, index, cb) => {
        scope.items.forEach((e, i) => {
          if (!e.disabled) {
            e.selected = i <= index;
          }
        });

        cb();
      };

      const toggle = (scope, index, cb) => {
        scope.items[index].selected = !scope.items[index].selected;

        cb();
      };

      const augment = (scope, cb) => {
        scope.onClick = (index) => {
          if (scope.items[index].disabled) {
            return;
          }

          scope.active = index;

          switch (scope.opts.type) {
            case 'slider':
              return slider(scope, index, cb);
            case 'toggle':
              return toggle(scope, index, cb);
            default:
              return radio(scope, index, cb);
          }
        };
      };

      const cbFactory = (fn, items) => () => {
        if (fn) {
          fn(getSelected(items));
        }
      };

      const init = (scope) => {
        augment(
          scope,
          cbFactory(scope.callback && scope.callback(), scope.items)
        );

        scope.active =
          _.length(scope.items) -
          1 -
          _.copy(scope.items)
            .reverse()
            .findIndex((e) => e.selected);
      };

      return {
        restrict: 'EA',
        link: init,
        scope: {
          opts: '=',
          items: '=',
          callback: '&?',
        },
        template: `<div class="breakdowns {{opts.type}}">
        <a data-ng-repeat="item in items track by $index" 
        class="waves-effect {{item.selected ? 'btn waves-light' : 'btn-flat'}}"
        ng-class="{disabled: item.disabled, active: $index === active}" 
        data-ng-click="onClick($index)">{{item.label}}</a>
      </div>`,
      };
    },
  ]);
