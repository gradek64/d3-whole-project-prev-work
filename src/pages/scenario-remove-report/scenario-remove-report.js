/**
 * Created by Sergiu Ghenciu on 17/07/2018
 */

'use strict';

angular
  .module('pages.scenario-remove-report', [
    'ngRoute',
    'utils.misc',
    'utils.constants',
    'utils.events',
    'services.settings-service',
    'services.levels-service',
    'services.costs-service',
    'services.report-levels-service',
    'utils.chart-data-format',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/scenario-analytics/remove/:entity/report', {
        templateUrl: 'pages/scenario-remove-report/scenario-remove-report.html',
        controller: 'ScenarioRemoveReportCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ALL],
        },
        name: 'scenario-remove-report',
      });
    },
  ])
  .controller('ScenarioRemoveReportCtrl', [
    'misc',
    '$scope',
    '$route',
    '$routeParams',
    'events',
    'CONSTANTS.EVENTS',
    'settingsService',
    'levelsService',
    'costsService',
    'reportLevelService',
    'chartDataFormat',
    function(
      _,
      $scope,
      $route,
      $routeParams,
      events,
      EVENTS,
      settingsService,
      levelsService,
      costsService,
      reportLevelService,
      cdf
    ) {
      const configId = _.prop('instanceId');

      const levelId = (levels, {id}) => {
        return _.compose(
          _.prop('id'),
          _.find(_.compose(_.identical(id), _.prop('name')))
        )(levels);
      };

      const digest = (scope) => {
        if (!scope.$$phase && !scope.$root.$$phase) {
          scope.$digest();
        }
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
            // console.log('level', res);
            scope[key] = res.data;
            // console.log('level', scope.level);
            digest(scope);
            return scope;
          });
      };

      const initTotal = (scope) => {
        // console.log('init total', scope.filters);
        costsService
          .getAll(
            configId(scope.output1),
            levelId(scope.levels1, reportLevelService.getOne('Services'))
          )
          .then(_.compose(_.prop('amount'), _.head, _.prop('data')))
          .then((amount) => {
            scope.total = cdf.formatCurrency(amount, amount < 0, '£');

            digest(scope);
          });
      };

      const setBreadcrumbs = (scope, entity) => {
        scope.breadcrumbs = [
          {
            href: '/#!/scenario-analytics',
            label: 'Scenario Analytics',
          },
          {
            href: '/#!/scenario-analytics/remove',
            label: 'Remove',
          },
          {
            href: '/#!/scenario-analytics/remove/' + entity,
            label: _.ucFirst(entity),
          },
          {
            href: '/#!/scenario-analytics/remove/' + entity + '/report',
            label: 'Report',
          },
        ];
      };

      const augment = (scope) => {};

      const init = (scope) => {
        augment(scope);
        const page = $route.current.name;
        const entity = $routeParams.entity;

        setBreadcrumbs(scope, entity);

        // scope.urlFilters = readQueryString('filters');
        // scope.filters = mapFilters(scope.urlFilters);
        scope.output1 = settingsService.getPrimaryOutput();
        scope.page = page;
        scope.entity = entity;

        if (scope.output1) {
          initLevels(scope).then(initTotal);
        }
      };

      init($scope);
    },
  ]);
