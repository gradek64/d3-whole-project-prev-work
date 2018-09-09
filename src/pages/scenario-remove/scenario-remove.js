/**
 * Created by Greg Gil on 15/01/2018
 */

'use strict';

angular
  .module('pages.scenario-remove', [
    'ngRoute',
    'utils.constants',
    'utils.events',
    'utils.misc',
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
      $routeProvider.when('/scenario-analytics/remove/:entity', {
        templateUrl: 'pages/scenario-remove/scenario-remove.html',
        controller: 'RemoveScenarioCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ADMIN],
        },
        name: 'remove-scenario',
      });
    },
  ])
  .controller('RemoveScenarioCtrl', [
    'misc',
    '$scope',
    '$route',
    '$routeParams',
    'events',
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

      const capitalizeFirstLetter = (name) =>
        name.replace(/^\w/, (c) => c.toUpperCase());

      const setBreadcrumbs = (entityName) => {
        const crumbs = [
          {
            href: '/#!/scenario-analytics',
            label: 'Scenario Analytics',
          },
          {
            href: '/#!/scenario-analytics/remove',
            label: 'Remove',
          },
          {
            href: '/#!/scenario-analytics/remove' + entityName,
            label: capitalizeFirstLetter(entityName),
          },
        ];
        $scope.breadcrumbs = crumbs;
      };

      const augment = (scope) => {
        scope.emit = events.emit;
      };

      const init = (scope) => {
        scope.pageName = $route.current.name;
        scope.isLoading = false;
        scope.attributeArray = [
          {label: 'Attribute 1', selected: false},
          {label: 'Attribute 2', selected: false},
          {label: 'Attribute 3', selected: false},
          {label: 'Attribute 4', selected: false},
          {label: 'Attribute 5', selected: false},
          {label: 'Attribute 6', selected: false},
          {label: 'Attribute 7', selected: false},
          {label: 'Attribute 8', selected: false},
          {label: 'Attribute 9', selected: false},
          {label: 'Attribute 10', selected: false},
        ];

        const entityName = $routeParams.entity;
        setBreadcrumbs(entityName);
        augment(scope);

        scope.output1 = settingsService.getPrimaryOutput();

        if (scope.output1) {
          initLevels(scope).then(initTotal);
        }
      };

      init($scope);
    },
  ]);
