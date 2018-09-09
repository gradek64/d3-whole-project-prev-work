/**
 * Created by Sergiu Ghenciu on 18/12/2017
 */

'use strict';

angular
  .module('components.dropdown-select', ['components.dropdown', 'utils.misc'])
  .directive('dropdownSelect', [
    'misc',
    function(_) {
      const reset = (scope) => (item) => {
        scope.onChange(item || scope.pleaseSelect, true);
      };

      const augment = (scope, cb) => {
        scope.onChange = (item, reset) => {
          scope.selected = item;
          scope.ngModel = item.value;

          if (reset) {
            return;
          }

          if (cb) {
            cb(item);
          }
        };
      };

      const preLink = (scope) => {
        const cb = scope.callback();
        augment(scope, cb);
        scope.id = 'ds-' + _.randomStr(4);

        scope.pleaseSelect = {label: scope.text, value: null};

        scope.initial =
          (scope.items && scope.items.find((e) => e.selected)) ||
          scope.pleaseSelect;

        scope.onChange(scope.initial, true);

        if (scope.resetFactory) {
          const rf = scope.resetFactory();
          if (rf) {
            rf(reset(scope));
          }
        }
      };

      return {
        restrict: 'EA',
        scope: {
          // opts: '=',
          selectAll: '=',
          className: '=',
          disabled: '=',
          text: '@',
          label: '@',
          items: '=',
          callback: '&',
          ngModel: '=?',
          resetFactory: '&?',
          name: '=',
        },
        link: {
          pre: preLink,
        },
        template:
          '<div class="select-wrapper">' +
          '<span class="caret">▼</span>' +
          '<input dropdown="{activates: id}" type="text" name="{{::name}}" ' +
          'class="select-dropdown" ng-class="className" readonly="true" ' +
          'value="{{selected.label}}" ng-disabled="disabled">' +
          '<ul id="{{::id}}" class="dropdown-content select-dropdown">' +
          '<li class="disabled please-select" ' +
          'ng-click="onChange(pleaseSelect)">' +
          '<span>{{::pleaseSelect.label}}</span></li>' +
          '<li ng-if="selectAll" ng-click="onChange(selectAll)">' +
          '<span>{{::selectAll.label}}</span></li>' +
          '<li ng-repeat="item in items track by $index" ' +
          'ng-class="{disabled: item.disabled}" ' +
          'ng-click="onChange(item)"><span>{{item.label}}<span ' +
          'ng-if="item.badge" ' +
          'class="badge">{{item.badge}}</span></span></li>' +
          '</ul>' +
          '</div>' +
          '<label>{{::label}}</label>',
      };
    },
  ]);
