/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular
  .module('pages.cost-overview', [
    'ngRoute',
    'utils.misc',
    'utils.events',
    'utils.constants',
    'services.report-id-service',
    'services.report-navs-service',
    'services.report-levels-service',
    'services.settings-service',
    'services.levels-service',
    'services.costs-service',
    'services.costs-service-total',
    'utils.chart-data-format',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider
        .when('/cost-overview/variance/:component?', {
          templateUrl: 'pages/cost-overview/cost-overview.html',
          controller: 'costOverviewCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ALL],
            isVariance: true,
          },
          name: 'cost-overview',
        })
        .when('/cost-overview/:component?', {
          templateUrl: 'pages/cost-overview/cost-overview.html',
          controller: 'costOverviewCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ALL],
          },
          name: 'cost-overview',
        });
    },
  ])
  .controller('costOverviewCtrl', [
    'misc',
    'events',
    '$scope',
    '$route',
    '$routeParams',
    '$location',
    'reportIdService',
    'reportNavsService',
    'reportLevelService',
    'settingsService',
    'levelsService',
    'costsService',
    'costsServiceTotal',
    'CONSTANTS.EVENTS',
    'chartDataFormat',
    function(
      _,
      events,
      $scope,
      $route,
      $routeParams,
      $location,
      reportIdService,
      reportNavsService,
      reportLevelService,
      settingsService,
      levelsService,
      costsService,
      costsServiceTotal,
      EVENTS,
      cdf
    ) {
      const configId = (output) => output.instanceId;

      const levelId = (levels, {id}) => {
        return _.prop('id', levels.find((e) => e.name === id));
      };

      const prefix = (page, isVariance) =>
        isVariance ? page + '/variance' : page;

      const initNav = (scope, page, isVariance, componentId, navs) => {
        const x = '/#!/' + prefix(page, isVariance);
        scope.navs = navs.map((e) => {
          return {
            label: e.label,
            href: x + '/' + e.id,
            active: e.id === componentId,
          };
        });
      };

      const initLevels = (scope, isSecondary) => {
        const key = isSecondary ? 'levels2' : 'levels1';
        scope[key] = null; // needed for triggering the re-rendering
        return levelsService
          .getAll(
            configId(_.prop(isSecondary ? 'output2' : 'output1', scope)),
            undefined,
            'model-srv'
          )
          .then((res) => {
            console.log('level', res);
            scope[key] = res.data;
            // console.log('level', scope.level);
            if (!scope.$$phase && !scope.$root.$$phase) {
              scope.$digest();
            }
            return scope;
          });
      };

      const initTotal = (scope) => {
        costsServiceTotal
          .getAll(
            configId(scope.output1),
            levelId(scope.levels1, reportLevelService.getOne('Target'))
          )
          .then((res) => {
            console.log('init total', res);
            const val = res.data[0].amount;
            scope.total = cdf.formatCurrency(val, val < 0, '£');

            if (!scope.$$phase && !scope.$root.$$phase) {
              scope.$digest();
            }
          });
      };

      const redirect = (page, isVariance, componentId) => {
        $location.path('/' + prefix(page, isVariance) + '/' + componentId);
      };

      const augment = (scope, page, isVariance, componentId) => {
        scope.toggleCallback = (state) => {
          redirect(page, state, componentId);
        };
        scope.useV2 = _.either(
          _.identical('service-list'),
          _.identical('functional')
        );
      };

      const bindEvents = (scope) => {
        const onOutput1Change = (output) => {
          scope.output1 = output;
          initLevels(scope).then(initTotal);
        };

        const onOutput2Change = (output) => {
          scope.output2 = output;
          initLevels(scope, true);
        };

        events.on(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutput1Change);
        events.on(EVENTS.SECONDARY_OUTPUT_CHANGED, onOutput2Change);
        scope.$on('$destroy', () => {
          events.off(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutput1Change);
          events.off(EVENTS.SECONDARY_OUTPUT_CHANGED, onOutput2Change);
        });
      };

      const firstTwo = _.pipe(_.moveDecimal(2), Math.floor);

      const init = (scope) => {
        const page = $route.current.name;
        const isVariance = $route.current.data.isVariance;
        const navs = reportNavsService.getAll(
          firstTwo(reportIdService.id(page, isVariance))
        );
        const componentId = $routeParams.component;

        if (!componentId) {
          return redirect(page, isVariance, navs[0].id);
        }

        augment(scope, page, isVariance, componentId);
        initNav(scope, page, isVariance, componentId, navs);
        bindEvents(scope);

        scope.output1 = settingsService.getPrimaryOutput();
        scope.output2 = settingsService.getSecondaryOutput();
        scope.page = page;
        scope.componentId = componentId;
        scope.isVariance = isVariance;

        if (scope.output1) {
          initLevels(scope).then(initTotal);
        }
        if (scope.output2) {
          initLevels(scope, true);
        }
      };

      init($scope);
    },
  ]);
