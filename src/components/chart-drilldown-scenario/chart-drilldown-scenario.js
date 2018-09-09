/**
 * Created by Sergiu Ghenciu on 12/06/2018
 */

'use strict';

angular
  .module('components.chart-drilldown-scenario', [
    'components.chart-drilldown-v2',
    'utils.misc',
    'services.costs-variance-service',
    'utils.events',
    'utils.constants',
  ])
  .directive('chartDrilldownScenario', [
    'misc',
    'costsVarianceService',
    'events',
    'CONSTANTS.EVENTS',
    '$q',
    function(_, costsVarianceService, events, EVENTS, $q) {
      const instanceId = _.prop('instanceId');

      const accessor = (groupBys, labelIndex = 0) => {
        const r = groupBys.reduce((a, e, i) => {
          const key = labelIndex === i ? 'label' : e.value;
          a[key] = e.value;
          return a;
        }, {});

        return _.merge(
          {
            table1: 'primary',
            table2: 'projected',
            costVariance: 'difference',
            costPercentage: 'diffPercentage',
            id: 'id',
          },
          r
        );
      };

      const header = _.pipe(
        _.values,
        _.difference([
          'primary',
          'projected',
          'difference',
          'diffPercentage',
          'id',
        ]),
        _.concat([
          'Primary Cost',
          'Projected Cost',
          'Cost Variance',
          'Percentage Variance',
        ])
      );

      const augment = (scope) => {
        scope.accessorFactory = () => accessor;
        scope.headerFactory = () => header;

        scope.params3 = () => {
          let o = {};

          o.filters = _.defaultTo([], scope.filters);

          o.primary = {
            configurationUuid: instanceId(scope.output1),
          };

          o.secondary = {
            configurationUuid: instanceId(scope.output2),
          };
          return o;
        };

        scope.getDataFactory = _.curry3((p3, p2, p1) => {
          // console.log(
          //   'http params',
          //   _.mergeDeepWithKeyAll(
          //     (k, b, a) => (k === 'filters' ? _.concat(b, a) : b),
          //     [p3, p2, p1]
          //   )
          // );
          return costsVarianceService
            .getAll(
              _.mergeDeepWithKeyAll(
                (k, b, a) => (k === 'filters' ? _.concat(b, a) : b),
                [p3, p2, p1]
              )
            )
            .then(_.prop('data'));
        });
      };

      const init = (scope) => {
        /* start-dev-block */
        console.log('------ THIS IS CHART-DRILLDOWN-SCENARIO ------');
        /* end-dev-block */

        augment(scope);
      };

      return {
        scope: {
          page: '=',
          nav: '=',
          output1: '=',
          output2: '=',
          levels1: '=',
          levels2: '=',
          filters: '=?',
        },
        link: {
          pre: init,
        },
        template: `
<div data-chart-drilldown-v2
data-page="page"
data-nav="nav"
data-levels1="levels1"
data-levels2="levels2"
data-get-data-factory="getDataFactory(params3())"
data-accessor-factory="accessorFactory()"
data-header-factory="headerFactory()"></div>
`,
      };
    },
  ]);
