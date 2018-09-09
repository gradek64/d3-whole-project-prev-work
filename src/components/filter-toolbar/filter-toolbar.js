/**
 * Created by Sergiu Ghenciu on 28/03/2018
 */

'use strict';

angular
  .module('components.filter-toolbar', [
    'components.dropdown-select-grouped',
    'utils.misc',
    'services.costs-service',
    'utils.events',
    'services.report-levels-service',
  ])
  .directive('filterToolbar', [
    'misc',
    'costsService',
    '$compile',
    'emitFactory',
    'reportLevelService',
    function(_, costsService, $compile, emitFactory, reportLevelService) {
      const template = () => `<div>
  <div class="input-field">
    <!--<loading opts="{size: 'small'}"></loading>-->
    <dropdown-select-grouped 
      select-all="{label: 'All', value: 'ALL'}"
      text="Please select" 
      label="{{::opts.label1}}"
      items="items1"
      reset-factory="resetFactory('1')"
      callback="onChange1"></dropdown-select-grouped>
  </div>
</div>

<div>
<div class="input-field">
    <dropdown-select-grouped 
      select-all="{label: 'All', value: 'ALL'}"
      text="Please select" 
      label="{{::opts.label2}}"
      items="items2"
      disabled="disabled2"
      reset-factory="resetFactory('2')"
      callback="onChange2"></dropdown-select-grouped>
</div>
</div>

<div>
<div class="input-field">
    <dropdown-select-grouped ng-if="opts.page === 'departmental-charges'"
      select-all="{label: 'All', value: 'ALL'}"
      text="Please select" 
      label="{{::opts.label3}}"
      items="items3"
      disabled="disabled3"
      reset-factory="resetFactory('3')"
      callback="onChange3"></dropdown-select-grouped>
      
    <dropdown-select-grouped ng-if="opts.page === 'service-statement'"
      text="Please select" 
      label="{{::opts.label3}}"
      items="items3"
      disabled="disabled3"
      reset-factory="resetFactory('3')"
      callback="onChange3"></dropdown-select-grouped>
</div>
</div>`;

      const render = (scope, element) => {
        // this is how one re-renders a directive in angularJs
        element
          .find('.filters')
          .html('')
          .append($compile(template())(scope));
      };

      const m = {};
      const reset = (name, visible, selected) => {
        m[name](visible, selected);
      };

      const getAll = () => m.all;

      const configId = (scope) => scope.output.instanceId;

      const levelId = ({levels}, {id}) => {
        if (_.undef(levels)) {
          return;
        }
        return _.prop('id', levels.find((e) => e.name === id));
      };

      const getSelected = (indexes) => (indexes === 'ALL' ? getAll() : indexes);

      const isArrayAndHasValues = (x) => _.isArray(x) && x.length !== 0;

      const findSelected = (scope, id) => {
        if (!scope.selected[id]) {
          return null;
        }
        if (scope.selected[id] === 'ALL') {
          return {label: 'All'};
        }
        return {label: scope.selected[id].value};
      };

      const indexToValue = (scope, id) => {
        const state = scope.state[id];
        if (!isArrayAndHasValues(state)) {
          return state;
        }
        const item = scope.data[state[0]];
        return {value: item[scope.accessor[id]]};
      };

      const valueToIndex = (scope, id) => {
        const selected = scope.selected[id];
        if (!selected || selected === 'ALL') {
          return selected;
        }
        return scope.data.reduce((a, e, i) => {
          if (e[scope.accessor[id]] === selected.value) {
            a.push(i);
          }
          return a;
        }, []);
      };

      const stateToSelected = (scope) => {
        return {
          first: indexToValue(scope, 'first'),
          second: indexToValue(scope, 'second'),
          third: indexToValue(scope, 'third'),
        };
      };

      const selectedToState = (scope) => {
        return {
          first: valueToIndex(scope, 'first'),
          second: valueToIndex(scope, 'second'),
          third: valueToIndex(scope, 'third'),
        };
      };

      // eslint-disable-next-line
      const getAccessor = groupBys => {
        return {
          first: groupBys[0].value,
          second: groupBys[1].value,
          third: groupBys[2].value,
        };
      };

      const initItems = (scope, groupBys) => {
        // console.log('init filters', groupBys);
        const id =
          scope.opts.page === 'service-statement' ? 'Services' : 'Target';
        const accessor = scope.accessor;
        return costsService
          .getAll(
            configId(scope),
            levelId(scope, reportLevelService.getOne(id)),
            {groupBy: groupBys}
          )
          .then((res) => {
            // console.log('getAll', res);
            scope.data = res.data;
          })
          .then(() => {
            scope.items1 = [];
            scope.items2 = [];
            scope.items3 = [];
            m.all = [];
            scope.data.forEach((e, i) => {
              m.all.push(i);
              // console.log(e);
              scope.items1.push({label: e[accessor.first]});
              scope.items2.push({label: e[accessor.second]});
              scope.items3.push({label: e[accessor.third]});
            });
          });

        /* ----------- filter-toolbar mock data ----------- */
        /* ----------- filter-toolbar mock data ----------- */
        /*
        scope.accessor = {first: 'a', second: 'b', third: 'c'};
        const accessor = scope.accessor;
        scope.data = [
          {a: 'Amet', b: 'Sit', c: 'Amet Sit'},
          {a: 'Amet', b: 'Elit', c: 'Amet Elit'},
          {a: 'Amet', b: 'Elit', c: 'Amet Elit 2'},
          {a: 'Lorem', b: 'Ipsum', c: 'Lorem Ipsum'},
        ];

        scope.items1 = [];
        scope.items2 = [];
        scope.items3 = [];
        m.all = [];
        scope.data.forEach((e, i) => {
          m.all.push(i);
          // console.log(e);
          scope.items1.push({label: e[accessor.first]});
          scope.items2.push({label: e[accessor.second]});
          scope.items3.push({label: e[accessor.third]});
        });
        */
      };

      const goDepartmentalCharges = (scope, element) => {
        const augment = (scope, cb) => {
          scope.resetFactory = (name) => (fn) => {
            m[name] = fn;
          };

          scope.onChange1 = (indexes) => {
            scope.disabled2 = indexes === null;
            scope.disabled3 = true;
            scope.state.first = indexes;

            const selected = getSelected(indexes);
            reset('2', selected);
            reset('3', selected);

            if (cb) {
              cb(null);
            }
          };
          scope.onChange2 = (indexes) => {
            scope.disabled3 = indexes === null;
            scope.state.second = indexes;
            reset('3');

            if (cb) {
              cb(null);
            }
          };
          scope.onChange3 = (indexes) => {
            scope.state.third = indexes;
            if (cb) {
              cb(indexes && stateToSelected(scope));
            }
          };
        };

        const init = (scope) => {
          scope.state = {};
          const selected = scope.selected;
          scope.disabled2 = !selected || !selected.first;
          scope.disabled3 = !selected || !selected.second;
          const groupBys = [
            {value: 'SOURCE_LEGAL_ENTITY'},
            {value: 'TARGET_LEGAL_ENTITY'},
            {value: 'TARGET_COST_CENTRE'},
          ];
          scope.accessor = getAccessor(groupBys);
          const cb = emitFactory('FILTERS_CHANGED');
          augment(scope, cb);
          initItems(scope, groupBys).then(() => {
            render(scope, element);
            // reset selected
            setTimeout(() => {
              if (!scope.selected) {
                return;
              }
              scope.state = selectedToState(scope);
              const visible1 = getSelected(scope.state.first);
              reset('1', null, findSelected(scope, 'first'));
              reset('2', visible1, findSelected(scope, 'second'));
              reset('3', visible1, findSelected(scope, 'third'));
              scope.$digest();
            }, 100);

            setTimeout(() => {
              scope.isLoading = false;
              scope.$digest();
            }, 300);
          });
        };

        init(scope);
      };

      const goServiceStatement = (scope, element) => {
        const augment = (scope, cb) => {
          scope.resetFactory = (name) => (fn) => {
            m[name] = fn;
          };

          scope.onChange1 = (indexes) => {
            scope.disabled2 = indexes === null;
            scope.disabled3 = indexes === null;
            scope.state.first = indexes;

            reset('2');

            const selected1 = indexes ? getSelected(indexes) : [];
            const selected2 = scope.state.second
              ? getSelected(scope.state.second)
              : [];

            reset('3', _.uniq(selected1.concat(selected2)));

            if (cb) {
              cb(null);
            }
          };
          scope.onChange2 = (indexes) => {
            scope.state.second = indexes;

            const selected1 = scope.state.first
              ? getSelected(scope.state.first)
              : [];

            const selected2 = indexes ? getSelected(indexes) : [];

            reset('3', _.uniq(selected1.concat(selected2)));

            if (cb) {
              cb(null);
            }
          };
          scope.onChange3 = (indexes) => {
            scope.state.third = indexes;
            if (cb) {
              cb(indexes && stateToSelected(scope));
            }
          };
        };

        const init = (scope) => {
          scope.state = {};
          const firstSelected = scope.selected && scope.selected.first;
          scope.disabled2 = !firstSelected;
          scope.disabled3 = !firstSelected;
          const groupBys = [
            {value: 'SERVICE_TYPE'},
            {value: 'SERVICE_GROUP'},
            {label: 'Service Name', value: 'SERVICE'},
          ];
          scope.accessor = getAccessor(groupBys);
          const cb = emitFactory('FILTERS_CHANGED');
          augment(scope, cb);
          initItems(scope, groupBys).then(() => {
            render(scope, element);
            // reset selected
            setTimeout(() => {
              // console.log('selected', scope.selected);
              if (!scope.selected) {
                return;
              }
              scope.state = selectedToState(scope);
              const visible1 = scope.state.first
                ? getSelected(scope.state.first)
                : [];
              const visible2 = scope.state.second
                ? getSelected(scope.state.second)
                : [];
              reset('1', null, findSelected(scope, 'first'));
              reset('2', null, findSelected(scope, 'second'));
              reset(
                '3',
                _.uniq(visible1.concat(visible2)),
                findSelected(scope, 'third')
              );
              scope.$digest();
            }, 100);

            setTimeout(() => {
              scope.isLoading = false;
              scope.$digest();
            }, 300);
          });
        };

        init(scope);
      };

      const init = (scope, element) => {
        if (scope.output) {
          scope.isLoading = true;
        }
        if (!scope.output || !scope.levels) {
          return;
        }

        // one might as well prefer to have different components
        switch (scope.opts.page) {
          case 'departmental-charges':
            return goDepartmentalCharges(scope, element);
          case 'service-statement':
            return goServiceStatement(scope, element);
        }
      };

      const link = (scope, element) => {
        // scope.ready = true;
        const cb = emitFactory('FILTERS_CHANGED');
        init(scope, element);

        scope.$watch('levels', (newVal, oldVal) => {
          if (newVal !== oldVal) {
            init(scope, element);
          }
        });
        scope.$watch('output', (newVal, oldVal) => {
          if (newVal !== oldVal) {
            scope.selected = null;
            if (cb) {
              cb(null);
            }
            // if (newVal !== null) {
            init(scope, element);
            // }
          }
        });
      };

      return {
        restrict: 'EA',
        scope: {
          opts: '=',
          selected: '=?',
          callback: '&?',
          output: '=',
          levels: '=',
        },
        link: {
          pre: link,
        },
        template: `<div class="filter-toolbar">
<div ng-show="!output" style="position:absolute; z-index:800;
                              top:0; right:0; bottom:0; left:0;
                              background: rgba(255,255,255,0.6);"></div>
<loading ng-show="isLoading && output" opts="{size: 'small'}"></loading>
<div class="container">
  <span class="title">Filters</span>
  <div class="filters">
  ${template()}
  </div>
</div>
</div>`,
      };
    },
  ]);
