/**
 * Created by Sergiu Ghenciu on 04/04/2018
 */

'use strict';
/* eslint-disable */
/* prettier-ignore */

angular
.module('components.chart-drilldown-variance', [
  'components.chart',
  'utils.misc',
  'services.costs-service',
  'services.report-id-service',
  'services.report-groupbys-service',
  'services.report-configs-service',
  'services.report-levels-service',
  'services.variance-service',
  'utils.events',
  'utils.constants',
  'utils.chart-data-format',
  'components.d3.prepare-data-service',
])
.directive('chartDrilldownVariance', [
  'misc',
  'costsService',
  'reportIdService',
  'reportConfigsService',
  'reportGroupbysService',
  'reportLevelService',
  'varianceService',
  'events',
  'CONSTANTS.EVENTS',
  'chartDataFormat',
  'prepareDataService',
  '$q',
  function(
      _,
      costsService,
      reportIdService,
      reportConfigsService,
      reportGroupbysService,
      reportLevelService,
      varianceService,
      events,
      EVENTS,
      cdf,
      pds,
      $q
  ) {
    const rm = {};
    const render = (id, data, accessor, opts) => {
      rm[id](data, accessor, opts);
    };

    const propValue = _.prop('value');

    const _formatCurrency = (n) => cdf.formatCurrency(n, n < 0, '£');

    const _formatPercentage = (n) => cdf.formatPercentage(n, n < 0);

    const isInfinity = _.pipe(_.abs, _.identical(Infinity));

    const formatPercentage = _.ifElse(isInfinity, _.always('-'), _formatPercentage);

    const formatCurrency = _.ifElse(isInfinity, _.always('-'), _formatCurrency);


    const idToFilters = (id) =>
        id.split(';').reduce((a, e) => {
          if (e !== '') {
            const parts = e.split(',');
            a.push({name: parts[0], value: parts[1]});
          }
          return a;
        }, []);

    const getAccessor = (groupBys, labelIndex = 0) => {
      const accessor = groupBys.reduce((a, e, i) => {
        const key = labelIndex === i ? 'label' : propValue(e);
        a[key] = propValue(e);
        return a;
      }, {});

      return Object.assign(accessor, {value: 'amount', id: 'id'});
    };

    const varianceAccessor = _.pipe(
        _.omit(['value']),
        _.merge({a: 'table1', b: 'table2', costVariance: 'costVariance', percentageVariance: 'percentageVariance'}));

    const expand = (scope) => {
      scope.showSecond = false;
      scope.showThird = false;
      scope.opts1.shrunk = false;
    };

    const shrink = (scope) => {
      return $q((resolve) => {
        // wait the animation to finish
        let sleep = 0;
        if (!scope.opts1.shrunk) {
          scope.opts1.shrunk = true;
          scope.$digest();
          sleep = 200;
        }
        setTimeout(resolve, sleep);
      });
    };

    const getConfig = (id) => {
      let config = reportConfigsService.getOne(id);
      if (_.undef(config)) {
        return;
      }

      // a bit of support for legacy
      config.type = propValue(_.find(_.prop('selected'), config.types));
      return config;
    };

    const reportId = ({page, componentId}, groupBys) =>
        reportIdService.id(page, true, componentId, groupBys);

    const isCostCategory = ({componentId}) => componentId === 'cost-category';

    const levelName = (scope, groupBys) =>
        _.prop('id', reportLevelService.getOne(reportId(scope, groupBys)));

    const configId = (output) => output.instanceId;

    const levelId = (levels, name) => {
      return _.prop('id', levels.find((e) => e.name === name));
    };

    const selectedGroupBys = ({groupByButtons}) =>
        groupByButtons.filter((e) => e.selected);

    const isWaterfall = (opts) =>
        opts.type === 'waterfall' ||
        opts.alternativeTypes.includes('waterfall');

    const getData = (scope, level, params) => {
      // return new Promise((resolve) => {
      //   setTimeout(function(){
      //
      //     const d1 = [
      //       {
      //         CostCategory: 'Staff',
      //         amount: 22794.81,
      //       },
      //       {
      //         CostCategory: 'Non-Staff',
      //         amount: 22150.34,
      //       },
      //       {
      //         CostCategory: 'Other',
      //         amount: 5824.0,
      //       },
      //     ];
      //
      //     const d2 = [
      //       {
      //         CostCategory: 'Staff',
      //         amount: 5263.2,
      //       },
      //       {
      //         CostCategory: 'Non-Staff',
      //         amount: 3812.25,
      //       },
      //       {
      //         CostCategory: 'Other',
      //         amount: 1523.65,
      //       },
      //     ];
      //
      //     resolve([d1, d2]);
      //
      //   }, 100);
      // });

      if (_.isArray(scope.filters)) {
        params.filters = _.isArray(params.filters)
            ? scope.filters.concat(params.filters)
            : scope.filters;
      }

      return $q.all([
        costsService.getAll(configId(scope.output1), levelId(scope.levels1, level), params),
        costsService.getAll(configId(scope.output2), levelId(scope.levels2, level), params),
      ]).then(_.pluck('data'));
    };

    const displayGroupedData = (opts) =>
        opts.type === 'waterfall' && _.def(opts.maximumWaterfallBridges);

    const groupData = (data, accessor, opts) =>
        varianceService.groupByVarianceCosts(
            _.copy(data),
            opts.maximumWaterfallBridges,
            accessor
        );

    const renderFirst = (scope, groupBys) => {
      const comp = scope.opts1;
      comp.isLoading = true;

      // console.log(comp);

      const accessor = getAccessor(groupBys);

      getData(scope, levelName(scope, groupBys), {groupBy: groupBys})
        .then((data) => {
          // console.log('accessor', accessor);
          // console.log('variance', data);

          let varianceTable = varianceService.mergeTables(data[0], data[1], accessor, ['id']);
          varianceTable = varianceService.computeVarianceCost(varianceTable);

          /* GROUP BRIDGES */
          if(displayGroupedData(comp)) {
            varianceTable = groupData(varianceTable, accessor, comp);
          }

          varianceTable = varianceService.computeVariancePercentage(varianceTable);

          // console.log('varianceTable', varianceTable);

          const total = varianceTable.reduce(
              function(a, e) {
                a.table1 += e.table1;
                a.table2 += e.table2;
                a.costVariance += e.costVariance;
                a.percentageVariance += e.percentageVariance;
                return a;
              },
              {table1: 0, table2: 0, costVariance: 0, percentageVariance: 0}
          );

          // console.log('total.table1', total.table1);
          comp.primaryTotal = total.table1;

          let percentageTotal = _.percentage(total.table2 - total.table1, total.table1);

          /* update chart info and render */
          // comp.variance.header[1] = $scope.currentSnapshot.name;
          // comp.variance.header[2] = $scope.secondarySnapshot.name;
          comp.header = [accessor.label, 'Primary Cost', 'Secondary Cost', 'Cost Variance', 'Percentage Variance',];
          comp.definition = ['string', 'currency', 'currency', 'currency', 'percentage',];
          comp.footer = [
            'Total',
            formatCurrency(total.table1),
            formatCurrency(total.table2),
            formatCurrency(total.costVariance),
            formatPercentage(percentageTotal)
          ];
          render(
              'first',
              varianceTable,
              {
                label: accessor.label,
                table1: 'table1',
                table2: 'table2',
                costVariance: 'costVariance',
                percentageVariance: 'percentageVariance',
                id: 'id',
              },
              comp
          );
        })
        .finally(() => {
          comp.isLoading = false;
        });
    };

    const renderSecond = (scope, d) => {
      const comp = scope.opts2;

      // console.log('second', comp);
      // console.log('isCostCategory', isCostCategory(scope));
      // console.log('d', d);


      scope.showSecond = true;
      scope.showThird = true;
      comp.isLoading = true;
      scope.opts3.isLoading = true;

      // variance cost-category exception
      if(isCostCategory(scope)) {
        if(d.label === 'Staff') {
          comp.groupByButtons = [{label: 'Role', value: 'ROLE', selected: true}]
        } else {
          comp.groupByButtons = [{label: 'Functional Level 1', value: 'ITFBLevel1', selected: true}]
        }
      }

      const groupBys2 = selectedGroupBys(comp);
      const accessor = getAccessor(groupBys2);

      const firstGroupBy = groupBys2[0];

      getData(
          scope,
          levelName(scope, selectedGroupBys(scope.opts1).concat(groupBys2)),
          {groupBy: groupBys2, filters: idToFilters(d.id)})
      .then((data) => {
        // console.log(data);

        var varianceTable = varianceService.mergeTables(data[0], data[1], accessor, _.keys(accessor));
        varianceTable = varianceService.computeVarianceCost(varianceTable);
        varianceTable = varianceService.computeVariancePercentage(varianceTable);

        // console.log('varianceTable', varianceTable)
        // console.log('comp.primaryTotal', scope.opts1.primaryTotal)

        var percentageData = varianceService.computePercentageOutOfPrimary(varianceTable, scope.opts1.primaryTotal, {label: propValue(firstGroupBy), value: 'costVariance'});

        // console.log('percentageData', percentageData)


        var dir = propValue(d) < 0 ? 'decrease' : 'increase';
        comp.title = 'Breakdown of ' + d.label + ' by ' + firstGroupBy.label;
        comp.subtitle = 'Viewing '+cdf.formatCurrency(Math.abs(propValue(d)), false, '£')+' ' +dir+ ', '+cdf.formatPercentage(Math.abs(d.percentage))+' '+dir+' from Primary to Secondary';

        render('second', percentageData, {id: 'id', label:'label', value:'value', percentage:'percentage'}, comp);


        /* additional table ( Explains the diagram above ) */

        // if(isCostCategory(scope)) {
        //   if(d.label === 'Staff') {
        //     comp.groupByButtons = [{label: 'Role', value: 'ROLE', selected: true}]
        //   } else {
        //     comp.groupByButtons = [
        //       {label: 'Functional Level 1', value: 'ITFBLevel1', selected: true},
        //       {label: 'Vendor', value: 'VENDOR', selected: true},
        //       {label: 'Category', value: 'COST_CATEGORY', selected: true},
        //     ]
        //   }
        // }

        var total = varianceTable.reduce(function (a, e) {
          a.table1 += e.table1;
          a.table2 += e.table2;
          a.costVariance += e.costVariance;
          a.percentageVariance += e.percentageVariance;
          return a;
        }, {table1: 0, table2: 0, costVariance: 0, percentageVariance: 0});

        var percentageTotal = _.percentage((total.table2 - total.table1), total.table1);

        /* update chart info and render */
        // component.variance.header[1] = $scope.currentSnapshot.name;
        // component.variance.header[2] = $scope.secondarySnapshot.name;
        scope.opts3.header = groupBys2.map(_.prop('label')).concat(['Primary Cost', 'Secondary Cost', 'Cost Variance', 'Percentage Variance']);
        scope.opts3.definition = _.repeat(_.length(groupBys2), 'string').concat(['currency', 'currency', 'currency', 'percentage']);
        scope.opts3.footer = ['Total']
        .concat(_.repeat(_.length(groupBys2) -1, ''))
        .concat([
          formatCurrency(total.table1),
          formatCurrency(total.table2),
          formatCurrency(total.costVariance),
          formatPercentage(percentageTotal)
        ]);

        render('third', varianceTable, varianceAccessor(accessor), scope.opts3);
      })
      .finally(() => {
        comp.isLoading = false;
        scope.opts3.isLoading = false;
      });
    };

    const renderThird = (scope, d1, d2) => {
      const comp = scope.opts3;

      // console.log('third', d1, d2)
      // console.log('third', comp);

      scope.showThird = true;
      comp.isLoading = true;

      // variance cost-category exception
      if(isCostCategory(scope)) {
        if(d1.label === 'Staff') {
          comp.groupByButtons = [{label: 'Role', value: 'ROLE', selected: true}]
        } else {
          comp.groupByButtons = [{label: 'Functional Level 1', value: 'ITFBLevel1', selected: true}]
        }
      }

      const groupBys3 = selectedGroupBys(comp);
      const accessor = getAccessor(groupBys3);

      var filters = idToFilters(d1.id + d2.id);

      const params = {
        groupBy: groupBys3,
        filters: filters,
      }

      getData(
          scope,
          levelName(
              scope,
              selectedGroupBys(scope.opts1).concat(
                  selectedGroupBys(scope.opts2),
                  groupBys3
              )
          ),
          params)
      .then((data) => {
        // console.log(data);

        var varianceTable = varianceService.mergeTables(data[0], data[1], accessor, _.keys(accessor));
        varianceTable = varianceService.computeVarianceCost(varianceTable);

        // console.log(varianceTable);

        var total = varianceTable.reduce(function (a, e) {
          a.table1 += e.table1;
          a.table2 += e.table2;
          a.costVariance += e.costVariance;
          a.percentageVariance += e.percentageVariance;
          return a;
        }, {table1: 0, table2: 0, costVariance: 0, percentageVariance: 0});

        /* update chart info and render */
        comp.header = _.pluck('label', groupBys3).concat(['Primary Cost', 'Secondary Cost', 'Cost Variance']);
        comp.definition = _.repeat(_.length(groupBys3), 'string').concat(['currency', 'currency', 'currency']);
        comp.footer = ['Total']
        .concat(_.repeat(_.length(groupBys3) -1, ''))
        .concat([
          formatCurrency(total.table1),
          formatCurrency(total.table2),
          formatCurrency(total.costVariance),
        ]);


        render('third', varianceTable, _.dissoc('percentageVariance', varianceAccessor(accessor)), comp);
      })
      .finally(() => {
        comp.isLoading = false;
      });
    };
    
    const initGroupByButtons2 = (scope, groupBys1) => {
      // console.log('initGroupByButtons2', reportId(scope, groupBys1));

      scope.opts2.groupByButtons = reportGroupbysService.getAll(
          reportId(scope, groupBys1)
      );
    };

    const initGroupByButtons3 = (scope, groupBys1, groupBys2) => {
      // console.log(
      //   '---------initGroupByButtons3',
      //   reportId(scope, groupBys1.concat(groupBys2))
      // );
      scope.opts3.groupByButtons = reportGroupbysService.getAll(
          reportId(scope, groupBys1.concat(groupBys2))
      );
    };

    const augment = (scope) => {
      scope.onExit = () => {
        expand(scope);
        scope.unAnchor();
      };

      scope.onFirstClick = (d, i, a) => {
        if (!scope.opts2) {
          return;
        }
        if(d.class === 'total') {
          return;
        }

        scope.anchor(d, i, a);

        scope.d1 = d;
        // console.log('first click', d);

        shrink(scope).then(() => {
          renderSecond(scope, d);
        });
      };

      scope.onSecondClick = (d) => {
        scope.d2 = d;
        // console.log('second click', d);
        renderThird(scope, scope.d1, d);
      };

      scope.onFirstGroupBy = (items) => {
        renderFirst(scope, items);

        if (scope.opts2) {
          initGroupByButtons2(scope, items);
        }
        if (scope.opts3) {
          initGroupByButtons3(scope, items, selectedGroupBys(scope.opts2));
        }
      };

      scope.onSecondGroupBy = (items) => {
        renderSecond(scope, d1);
        initGroupByButtons3(scope, selectedGroupBys(scope.opts1), items);
      };

      scope.onFirstChangeType = (type) => {
        scope.opts1.type = propValue(type);
        initChart(scope);
      };

      scope.renderFactory = (id) => (fn) => {
        rm[id] = fn;
      };

      scope.anchoringFactory = (i) => (fn) => {
        scope.anchor = fn();
        scope.unAnchor = fn(true);
      };
    };

    const initChart = (scope) => {
      renderFirst(scope, selectedGroupBys(scope.opts1));
    };

    const bindEvents = (scope) => {
      const onFiltersChange = () => {
        setTimeout(() => {
          initChart(scope);
        }, 0);
      };
      events.on(EVENTS.FILTERS_CHANGED, onFiltersChange);

      scope.$on('$destroy', () => {
        events.off(EVENTS.FILTERS_CHANGED, onFiltersChange);
      });
    };

    const init = (scope) => {
      scope.opts1 = getConfig(reportId(scope));
      if (!scope.opts1) {
        return;
      }

      augment(scope);

      const selected1 = selectedGroupBys(scope.opts1);
      scope.opts2 = getConfig(
          reportId(scope, selected1)
      );
      if (scope.opts2) {
        scope.opts3 = getConfig(
            reportId(scope, selected1.concat(selectedGroupBys(scope.opts2)))
        );
        // console.log('opts3', scope.opts3)
      }
      scope.data1 = [];
      scope.data2 = [];
      scope.data3 = [];
      scope.accessor1 = {};
      scope.accessor2 = {};
      scope.accessor3 = {};

      initChart(scope);
      bindEvents(scope);
    };

    return {
      scope: {
        page: '=',
        componentId: '=',
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
<div ng-if="!opts1" class="no-output">
    <h1>No report</h1>
</div>
<div ng-if="opts1" class="chart-drilldown" 
ng-class="{shrunk: opts1.shrunk}">
<div class="first" data-chart data-opts="opts1"
                        data-data="data1"
                        data-accessor="accessor1"
                        data-render-factory="renderFactory('first')"
                        data-on-leaf-click="onFirstClick"
                        data-on-group-by-click="onFirstGroupBy"
                        data-on-change-type="onFirstChangeType"
                        data-on-exit="onExit"
                        data-anchoring-factory="anchoringFactory()"></div>
                        
<div ng-if="showSecond" class="second" data-chart data-opts="opts2"
                        data-data="data2"
                        data-accessor="accessor2"
                        data-render-factory="renderFactory('second')"
                        data-on-leaf-click="onSecondClick"
                        data-on-group-by-click="onSecondGroupBy"
                        data-anchor="false"></div>
                        
<div ng-if="showThird" class="third" data-chart data-opts="opts3"
                        data-data="data3"
                        data-accessor="accessor3"
                        data-render-factory="renderFactory('third')"></div>
                        
</div>`,
    };
  },
]);
