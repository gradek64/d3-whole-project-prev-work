/**
 * Created by Sergiu Ghenciu on 22/03/2018
 */

'use strict';

angular
  .module('components.chart-no-drilldown', [
    'components.chart',
    'utils.misc',
    'services.costs-service-mock',
  ])
  .directive('chartNoDrilldown', [
    'misc',
    'costsServiceMock',
    function(_, costsService) {
      const rm = {};

      const render = (name, data, accessor, opts) => {
        rm[name](data, accessor, opts);
      };

      const getAccessor = (groupBys, labelIndex) => {
        const accessor = groupBys.reduce((a, e, i) => {
          // const key = labelIndex === i ? 'label' : e.value;
          a[e.value] = e.value;
          return a;
        }, {});

        return Object.assign(accessor, {value: 'amount', id: 'id'});
      };

      const renderChart = (scope, groupBys) => {
        const comp = scope.component;

        comp.isLoading = true;
        costsService
          .getAll(1, 1, {
            groupBy: groupBys,
            typeForMock: comp.type,
          })
          .then((res) => {
            comp.footer = _.repeat(_.length(groupBys) + 2, '');
            comp.footer[0] = 'Total';
            comp.footer[_.length(comp.footer) - 1] = '£576.00';

            render('chart', res.data, getAccessor(groupBys, 0), comp);
          })
          .finally(() => {
            comp.isLoading = false;
            scope.$digest();
          });
      };

      const augment = (scope) => {
        scope.renderFactory = (name) => (fn) => {
          rm[name] = fn;
        };

        scope.onGroupBy = (items) => {
          // console.log('no-drilldown click', items);
          renderChart(scope, items);
        };
      };

      const init = (scope) => {
        augment(scope);
        scope.data = [];
        scope.accessor = {};

        // todo: we should have three different types of group-by buttons
        // 1. radio, multiple-select and slider
        if (scope.component.id === 'it-resource-stack') {
          const index = scope.component.groupByButtons.findIndex(
            (e) => e.selected
          );
          const groupBys = scope.component.groupByButtons.slice(0, index + 1);
          renderChart(scope, groupBys);
          return;
        }
        // prettier-ignore
        const groupBys = scope.component.groupByButtons.filter(
            (e) => e.selected);
        renderChart(scope, groupBys);
      };

      return {
        scope: {
          component: '=',
        },
        link: {
          pre: init,
        },
        template: `
<div data-chart data-opts="component"
                        data-data="data"
                        data-accessor="accessor"
                        data-render-factory="renderFactory('chart')"
                        data-on-group-by-click="onGroupBy"
                        data-anchor="false"></div>
`,
      };
    },
  ]);
