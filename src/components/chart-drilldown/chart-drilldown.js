/**
 * Created by Sergiu Ghenciu on 10/03/2018
 */

'use strict';

angular
  .module('components.chart-drilldown', [
    'components.chart',
    'utils.misc',
    'services.costs-service',
    'services.costs-service-mock',
    'services.report-id-service',
    'services.report-groupbys-service',
    'services.report-configs-service',
    'services.report-levels-service',
    'utils.events',
    'utils.constants',
    'utils.chart-data-format',
    'components.d3.prepare-data-service',
  ])
  .directive('chartDrilldown', [
    'misc',
    'costsService',
    'costsServiceMock',
    'reportIdService',
    'reportConfigsService',
    'reportGroupbysService',
    'reportLevelService',
    'events',
    'CONSTANTS.EVENTS',
    'chartDataFormat',
    'prepareDataService',
    '$q',
    function(
      _,
      costsService,
      costsServiceMock,
      reportIdService,
      reportConfigsService,
      reportGroupbysService,
      reportLevelService,
      events,
      EVENTS,
      cdf,
      pds,
      $q
    ) {
      const propValue = _.prop('value');

      const getAccessor = (groupBys, labelIndex = 0) => {
        const accessor = groupBys.reduce((a, e, i) => {
          const key = labelIndex === i ? 'label' : propValue(e);
          a[key] = propValue(e);
          return a;
        }, {});

        return Object.assign(accessor, {
          percentage: 'percentage',
          value: 'amount',
          id: 'id',
        });
      };

      const headerMap = {
        Amount: 'currency',
        Percentage: 'percentage',
      };

      const definition = (header) =>
        header.map((e) => (headerMap[e] ? headerMap[e] : 'string'));

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
        reportIdService.id(page, false, componentId, groupBys);

      const levelName = (scope, groupBys) =>
        _.prop('id', reportLevelService.getOne(reportId(scope, groupBys)));

      const configId = ({output}) => output.instanceId;

      const levelId = ({levels}, name) => {
        return _.prop('id', levels.find((e) => e.name === name));
      };

      const getData = (scope, level, params) => {
        console.log('get data levelName', level);
        console.log('get data params', level);
        // 6f286b17-9be8-4f2c-80c8-ad5e65951922
        console.log('levelId(scope, level)', levelId(scope, level));
        console.log('configId(scope)', configId(scope));

        if (_.isArray(scope.filters)) {
          params.filters = _.isArray(params.filters)
            ? scope.filters.concat(params.filters)
            : scope.filters;
        }
        /* return costsService
          .getAll(configId(scope), levelId(scope, level), params)
          .then((res) => res.data);*/

        return costsServiceMock
          .getAll(configId(scope), levelId(scope, level), params)
          .then((res) => res.data);
      };

      const selectedGroupBys = ({groupByButtons}) =>
        groupByButtons.filter((e) => e.selected);

      const idToFilters = (id) =>
        id.split(';').reduce((a, e) => {
          if (e !== '') {
            const parts = e.split(',');
            a.push({name: parts[0], value: parts[1]});
          }
          return a;
        }, []);

      const renderFirst = (scope, groupBys) => {
        const comp = scope.opts1;
        comp.isLoading = true;

        const accessor = getAccessor(groupBys);

        getData(scope, levelName(scope, groupBys), {groupBy: groupBys})
          .then((data) => {
            console.log('first data', data);

            const total = pds.computeTotal(data, 'amount');
            data = pds.addPercentage(data, 'amount', total);

            // if (comp.type === 'table') {
            comp.header = _.map(_.ucFirst, _.values(_.dissoc('id', accessor)));
            comp.definition = definition(comp.header);

            comp.footer = _.repeat(_.length(groupBys) + 2, '');
            comp.footer[0] = 'Total';
            comp.footer[_.length(comp.footer) - 1] = cdf.formatCurrency(
              total,
              total < 0,
              '£'
            );
            // }
            scope.render1(data, accessor, comp);
          })
          .finally(() => {
            comp.isLoading = false;
          });
      };

      const renderSecond = (scope, d) => {
        // console.log('d', d);
        const comp = scope.opts2;

        // const groupBys1 = selectedGroupBys(scope.opts2);
        // const groupBys2 = selectedGroupBys(comp);

        scope.showSecond = true;
        scope.showThird = false;
        comp.isLoading = true;

        const groupBys2 = selectedGroupBys(comp);

        // console.log('groupBys2 ------', groupBys2);
        getData(
          scope,
          levelName(scope, selectedGroupBys(scope.opts1).concat(groupBys2)),
          {groupBy: groupBys2, filters: idToFilters(d.id)}
        )
          .then((data) => {
            // console.log(data);
            scope.render2(data, getAccessor(groupBys2), comp);
          })
          .finally(() => {
            comp.isLoading = false;
          });
      };

      const renderThird = (scope, d1, d2) => {
        // console.log('d1, d2', d1, d2);
        const comp = scope.opts3;

        scope.showThird = true;
        comp.isLoading = true;

        // const groupBys = [{value: 'SOURCE_COST_CENTRE'}];
        const groupBys3 = selectedGroupBys(comp);
        const accessor = getAccessor(groupBys3);
        // console.log('third groupbys -------', groupBys3);

        // return;

        getData(
          scope,
          levelName(
            scope,
            selectedGroupBys(scope.opts1).concat(
              selectedGroupBys(scope.opts2),
              groupBys3
            )
          ),
          {
            groupBy: groupBys3,
            filters: idToFilters(d1.id + d2.id),
          }
        )
          .then((data) => {
            console.log(data);
            // return;
            const total = pds.computeTotal(data, 'amount');
            data = pds.addPercentage(data, 'amount', total);

            // if (comp.type === 'table') {
            comp.header = _.map(_.ucFirst, _.values(_.dissoc('id', accessor)));
            comp.definition = definition(comp.header);

            comp.footer = _.repeat(_.length(groupBys3) + 2, '');
            comp.footer[0] = 'Total';
            comp.footer[_.length(comp.footer) - 1] = cdf.formatCurrency(
              total,
              total < 0,
              '£'
            );
            // }
            scope.render3(data, accessor, comp);
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
        //   'initGroupByButtons3',
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

          scope.anchor(d, i, a);

          scope.d1 = d;
          // console.log('first click', d);

          shrink(scope).then(() => {
            renderSecond(scope, d);
          });
        };

        scope.onSecondClick = (d) => {
          // console.log('second click', d);
          renderThird(scope, scope.d1, d);
        };

        scope.onFirstGroupBy = (items) => {
          // console.log('onFirstGroupBy', items);
          renderFirst(scope, items);

          if (scope.opts2) {
            initGroupByButtons2(scope, items);
          }
          if (scope.opts3) {
            initGroupByButtons3(scope, items, selectedGroupBys(scope.opts2));
          }
        };

        scope.onSecondGroupBy = (items) => {
          // console.log('onSecondGroupBy', items);
          renderSecond(scope, scope.d1);
          initGroupByButtons3(scope, selectedGroupBys(scope.opts1), items);
        };

        scope.onFirstChangeType = (type) => {
          scope.opts1.type = propValue(type);
          initChart(scope);
        };

        scope.renderFactory = (fnName) => (fn) => {
          scope[fnName] = fn;
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
        scope.opts2 = getConfig(reportId(scope, selected1));
        if (scope.opts2) {
          scope.opts3 = getConfig(
            reportId(scope, selected1.concat(selectedGroupBys(scope.opts2)))
          );
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
          output: '=',
          levels: '=',
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
                        data-render-factory="renderFactory('render1')"
                        data-on-leaf-click="onFirstClick"
                        data-on-group-by-click="onFirstGroupBy"
                        data-on-change-type="onFirstChangeType"
                        data-on-exit="onExit"
                        data-anchoring-factory="anchoringFactory()"></div>
                        
<div ng-if="showSecond" class="second" data-chart data-opts="opts2"
                        data-data="data2"
                        data-accessor="accessor2"
                        data-render-factory="renderFactory('render2')"
                        data-on-leaf-click="onSecondClick"
                        data-on-group-by-click="onSecondGroupBy"
                        data-anchor="false"></div>
                        
<div ng-if="showThird" class="third" data-chart data-opts="opts3"
                        data-data="data3"
                        data-accessor="accessor3"
                        data-render-factory="renderFactory('render3')"></div>
                        
</div>`,
      };
    },
  ]);
