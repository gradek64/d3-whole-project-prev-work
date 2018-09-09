/**
 * Created by Sergiu Ghenciu on 22/06/2018
 */

'use strict';

angular
  .module('components.chart-drilldown-v2', [
    'utils.misc',
    'components.chart-draw',
    'services.report-id-service',
    'services.report-configs-service',
    'services.report-levels-service',
  ])
  .directive('chartDrilldownV2', [
    'misc',
    'reportIdService',
    'reportConfigsService',
    'reportLevelService',
    '$q',
    '$timeout',
    function(
      _,
      reportIdService,
      reportConfigsService,
      reportLevelService,
      $q,
      $timeout
    ) {
      const reducerFactory = (operand, fn) => (a, b) => operand(a, fn(b));

      const add1 = _.add(1);

      const propComponents = _.prop('components');

      const propBreadcrumbs = _.prop('breadcrumbs');

      const propGroupByButtons = _.prop('groupByButtons');

      const propSelected = _.prop('selected');

      const filterSelected = _.filter(propSelected);

      const selectedGroupBys = _.pipe(propGroupByButtons, filterSelected);

      // const whenDefPropType = _.when(_.def, _.prop('type'));

      const concatSelectedGroupBys = _.reduce(
        reducerFactory(_.flip(_.concat), selectedGroupBys),
        []
      );

      const reportId = (scope, index) => {
        return reportIdService.id(
          scope.page,
          scope.isVariance,
          scope.nav,
          concatSelectedGroupBys(_.take(index, propComponents(scope)))
        );
      };

      const getConfig = (id) => {
        // a bit of support for legacy
        return _.unless(
          _.undef,
          _.converge(_.assoc('type'), [
            _.pipe(_.prop('types'), _.find(propSelected), _.prop('value')),
            _.id,
          ]),
          reportConfigsService.getOne(id)
        );
      };

      const levelName = (id) => _.prop('id', reportLevelService.getOne(id));

      const findLevelId = (levels, name) => {
        return _.prop('id', _.find((e) => e.name === name, levels));
      };

      // todo: review this
      const expand = (scope) => {
        scope.components[0].shrunk = false;
      };

      const shrink = (scope) => {
        return $q((resolve) => {
          // wait the animation to finish
          let sleep = 0;
          if (!scope.components[0].shrunk) {
            scope.components[0].shrunk = true;
            scope.$digest();
            sleep = 200;
          }
          setTimeout(resolve, sleep);
        });
      };

      const anchor = (scope, i, d, di, da) => scope.anchor[i]()(d, di, da);

      const unAnchor = (scope, i) => scope.anchor[i](true)();

      const augment = (scope) => {
        scope.def = _.def;

        scope.onExit = (i) => () => {
          scope.components = _.slice(0, add1(i), propComponents(scope));
          scope.breadcrumbs = _.slice(0, i, propBreadcrumbs(scope));
          expand(scope);
          unAnchor(scope, i);
        };

        scope.onGroupBy = (i) => (selected) => {
          // console.log('onGroupBy', selected);
          scope.breadcrumbs = _.slice(0, i, propBreadcrumbs(scope));
          scope.components = _.slice(0, add1(i), propComponents(scope));
          unAnchor(scope, i);
        };

        scope.onChangeType = (i) => (type) => {
          // console.log('onChangeType', type);
          unAnchor(scope, i);
        };

        scope.onClick = (i) => {
          return (d, di, da) => {
            // console.log('i', i, 'da', da);
            if (i === 0 && d.class === 'total') {
              return;
            }

            let next = getConfig(reportId(scope, add1(i)));

            if (_.undef(next)) {
              return;
            }

            anchor(scope, i, d, di, da);

            next.titleTemplate = next.title;
            next.subtitleTemplate = next.subtitle;

            shrink(scope).then(() => {
              scope.components = _.slice(0, add1(i), propComponents(scope));
              scope.breadcrumbs = _.slice(0, add1(i), propBreadcrumbs(scope));

              $timeout(() => {
                scope.breadcrumbs[i] = _.copyObj(d);

                scope.components[add1(i)] = next;
              }, 0);
            });
          };
        };

        scope.params2 = (index) => {
          let o = {};
          let id = reportId(scope, index);
          let name = levelName(id);

          o.reportId = id;

          o.primary = {
            levelId: findLevelId(scope.levels1, name),
          };

          o.secondary = {
            levelId: findLevelId(scope.levels2, name),
          };
          return o;
        };

        // lift this function upper in order to have custom rules per report
        scope.reportIdFactory = (index) => {
          const prefix = reportId(scope, index);

          if (
            _.identical('service-list', scope.nav) &&
            _.either(_.identical(0), _.identical(1), index)
          ) {
            // the purpose of this id is to create a uniq id
            return (type) =>
              _.add(prefix, _.divide(10, reportIdService.typeId(type)));
          }
          return () => prefix;
        };

        scope.anchoringFactory = (i) => (fn) => {
          scope.anchor[i] = fn;
        };
      };

      const init = (scope) => {
        /* start-dev-block */
        // console.log('------ THIS IS CHART-DRILLDOWN-V2 ------');
        /* end-dev-block */

        scope.breadcrumbs = [];

        scope.components = [];

        scope.anchor = [];

        let config = getConfig(reportId(scope, 0));

        if (_.undef(config)) {
          return;
        }

        config.titleTemplate = config.title;
        config.subtitleTemplate = config.subtitle;

        scope.components[0] = config;

        augment(scope);
      };

      return {
        scope: {
          page: '=',
          nav: '=',
          isVariance: '=',
          levels1: '=',
          levels2: '=',
          getDataFactory: '&',
          accessorFactory: '&',
          headerFactory: '&',
        },
        link: {
          pre: init,
        },
        template: `
<div ng-if="!def(components[0])" class="no-output">
    <h1>No report</h1>
</div>

<div ng-if="def(components[0])" class="chart-drilldown" 
ng-class="{shrunk: components[0].shrunk}">

  <div data-ng-repeat="opts in components track by $index" 
        class="comp{{$index}}"
        data-chart-draw
        data-opts="opts"
        data-anchoring-factory="anchoringFactory($index)"
        data-on-click="::onClick($index)"
        data-get-data-factory="getDataFactory()(params2($index))"
        data-accessor-factory="accessorFactory()"
        data-header-factory="headerFactory()"
        data-report-id="reportIdFactory($index)"
        data-crumbs="::breadcrumbs"
        data-on-exit="::onExit($index)"
        data-on-group-by="::onGroupBy($index)"
        data-on-change-type="::onChangeType($index)"
        ></div>
</div>`,
      };
    },
  ]);
