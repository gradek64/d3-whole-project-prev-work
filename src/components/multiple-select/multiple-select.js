/**
 * Created by Sergiu Ghenciu on 22/02/2018
 */

'use strict';

angular
  .module('components.multiple-select', ['components.dropdown', 'utils.misc'])
  .directive('multipleSelect', [
    'misc',
    function(_) {
      // $& means the whole matched string
      const escapeRegExp = (string) =>
        string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // prettier-ignore
      const set = (items, checked) =>
          items.forEach((e) => (e.checked = checked));

      const isVisible = (item) => !item.hide;

      const isChecked = (item) => item.checked;

      const getVisible = (items) => items.filter(isVisible);

      const areAllChecked = (items) => items.every(isChecked);

      const computeText = (scope) => {
        const checked = scope.items.filter(isChecked);

        if (checked.length === 0) {
          return scope.text;
        }

        if (checked.length === scope.items.length) {
          return 'All selected';
        }

        if (checked.length < 4) {
          return checked.map((e) => String(e.label)).join(', ');
        }

        return checked.length + ' of ' + scope.items.length + ' selected';
      };

      const callback = (scope) => {
        scope.state = computeText(scope);

        if (scope.callback) {
          scope.callback()(
            scope.items.reduce((a, e, i) => {
              if (isChecked(e)) {
                a.push(i);
              }
              return a;
            }, [])
          );
        }
      };

      const augment = (scope) => {
        scope.isVisible = isVisible;

        scope.onToggle = (open) => {
          console.log(open);
        };

        scope.onSearch = (term) => {
          const re = RegExp(escapeRegExp(term), 'i');

          scope.items.forEach((e) => {
            e.hide = !re.test(e.label);
          });

          const visible = getVisible(scope.items);

          scope.selectAll.checked = areAllChecked(visible);

          scope.noMatches = term && visible.length === 0;
        };

        scope.onSelectAll = (item) => {
          set(getVisible(scope.items), item.checked);
          callback(scope);
        };

        scope.onChange = (item, reset) => {
          scope.selectAll.checked = areAllChecked(getVisible(scope.items));

          if (reset) {
            return;
          }
          callback(scope);
        };
      };

      const reset = (scope) => (selected = scope.initial) => {
        scope.items.forEach((e, i) => (e.checked = selected.includes(i)));
        scope.onChange(null, true);
      };

      const preLink = (scope) => {
        augment(scope);

        scope.id = 'ms-' + _.randomStr(4);

        scope.selectAll = {label: '(Select All)', value: null};

        scope.initial =
          (scope.items && scope.items.filter(isChecked).map((e, i) => i)) || [];

        scope.state = computeText(scope);

        if (scope.resetFactory) {
          scope.resetFactory()(reset(scope));
        }
      };

      /* eslint-disable */
      return {
        restrict: 'EA',
        scope: {
          filter: '=',
          noSelectAll: '=',
          group: '=',
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
          '<div class="select-wrapper multiple">' +
          '<span class="caret">▼</span>' +
          '<input dropdown="{activates: id, beloworigin: true, autoClose: false}" callback="onToggle" type="text" class="select-dropdown" readonly="true" value="{{state}}">' +
          '<div id="{{::id}}" class="dropdown-content select-dropdown">' +
          '<div ng-if="filter" class="input-field">' +
          '<i class="material-icons prefix">search</i>' +
          '<input type="text" placeholder="search" ng-model="term" ng-change="onSearch(term)">' +
          '</div>' +
          '<div ng-show="noMatches" class="none">No matches found</div>' +
          '<ul ng-hide="noMatches">' +
          '<li ng-if="::!noSelectAll">' +
          '<span>' +
          '<input type="checkbox" id="{{::id}}-1" ng-model="selectAll.checked" ng-change="onSelectAll(selectAll)">' +
          '<label for="{{::id}}-1">{{::selectAll.label}}</label>' +
          '</span>' +
          '</li>' +
          '<li ng-repeat="item in items | filter:isVisible track by $index">' +
          '<span>' +
          '<input type="checkbox" id="{{::id}}{{::$index}}" ng-model="item.checked" ng-change="onChange(item)">' +
          '<label for="{{::id}}{{::$index}}">{{item.label}}</label>' +
          '<span ng-if="::item.badge" class="badge">{{::item.badge}}</span></span>' +
          '</span>' +
          '</li>' +
          '</ul>' +
          '</div>' +
          '</div>' +
          '<label ng-if="::label">{{::label}}</label>'
      };
    }
  ]);
